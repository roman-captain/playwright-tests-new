import os
import json
import sys
from dotenv import load_dotenv
from groq import Groq
from langfuse import Langfuse
from deepeval.models.base_model import DeepEvalBaseLLM
from deepeval.metrics import HallucinationMetric, AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

load_dotenv()

BOT_MODEL   = "llama-3.1-8b-instant"     # fast analysis
JUDGE_MODEL = "llama-3.3-70b-versatile"  # strict evaluation

bot_client   = Groq(api_key=os.getenv("GROQ_API_KEY"))
judge_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

langfuse = Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
)

SYSTEM_PROMPT = """You are an expert QA engineer analyzing automated test failures.

For each test failure, provide a structured analysis:
1. FAILURE TYPE: classify as one of: [locator_issue, timing_issue, environment_issue, real_bug, test_data_issue]
2. ROOT CAUSE: brief explanation of why this likely failed
3. IS REAL BUG: yes/no
4. CONFIDENCE: low/medium/high
5. RECOMMENDED ACTION: what the QA engineer should do next

Be precise and concise. Base your analysis only on the error message and context provided."""


class GroqJudge(DeepEvalBaseLLM):
    def load_model(self): return judge_client

    def generate(self, prompt: str) -> str:
        response = judge_client.chat.completions.create(
            model=JUDGE_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content

    async def a_generate(self, prompt: str) -> str:
        return self.generate(prompt)

    def get_model_name(self) -> str:
        return f"groq/{JUDGE_MODEL}"


judge = GroqJudge()

dataset_path = "failures_dataset.json"
if not os.path.exists(dataset_path):
    print("No failures_dataset.json found. Run parser.py first.")
    sys.exit(0)

with open(dataset_path) as f:
    failures = json.load(f)

if not failures:
    print("No failures to analyze. All tests passed.")
    sys.exit(0)

print(f"=== AI QA Pipeline: {len(failures)} failure(s) to analyze ===\n")
print(f"Bot   : groq/{BOT_MODEL}")
print(f"Judge : groq/{JUDGE_MODEL}\n")

for failure in failures:
    print(f"[{failure['id']}] {failure['test_name']}")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Test: {failure['test_name']}\nError: {failure['error']}\nContext: {failure['context']}"}
    ]

    # Step 1: Bot analyzes failure, logs trace to Langfuse
    with langfuse.start_as_current_observation(
        name=f"analyze-{failure['id']}",
        input=messages,
        metadata={"test_name": failure["test_name"], "bot_model": BOT_MODEL}
    ) as obs:
        response = bot_client.chat.completions.create(
            model=BOT_MODEL,
            messages=messages
        )
        analysis = response.choices[0].message.content
        obs.update(output=analysis)
        trace_id = langfuse.get_current_trace_id()

    print(f"  Bot analysis done (trace_id: {trace_id})")

    # Step 2: DeepEval judge evaluates the bot analysis
    test_case = LLMTestCase(
        input=f"Analyze this test failure: {failure['error']}",
        actual_output=analysis,
        context=[failure["context"]]
    )

    hallucination = HallucinationMetric(threshold=0.5, model=judge)
    relevancy     = AnswerRelevancyMetric(threshold=0.5, model=judge)
    hallucination.measure(test_case)
    relevancy.measure(test_case)
    passed = hallucination.score <= 0.5 and relevancy.score >= 0.5

    # Step 3: Write scores back to the same Langfuse trace
    if trace_id:
        langfuse.create_score(trace_id=trace_id, name="hallucination", value=hallucination.score, comment=hallucination.reason)
        langfuse.create_score(trace_id=trace_id, name="relevancy",     value=relevancy.score,     comment=relevancy.reason)
        langfuse.create_score(trace_id=trace_id, name="audit-passed",  value=1.0 if passed else 0.0)

    print(f"  Hallucination : {hallucination.score:.2f} ({'OK' if hallucination.score <= 0.5 else 'FAIL'})")
    print(f"  Relevancy     : {relevancy.score:.2f} ({'OK' if relevancy.score >= 0.5 else 'FAIL'})")
    print(f"  Overall       : {'PASS' if passed else 'FAIL'}")
    print()

langfuse.flush()
print("Done. Open Langfuse to see traces with scores.")
