# playwright-tests-new

Playwright E2E test suite - AQA internship practice project.

Built to Wiki standard

## Tech Stack

| Component        | Technology                        |
|------------------|-----------------------------------|
| Language         | TypeScript + Python               |
| Test Framework   | Playwright                        |
| Test Runner      | Playwright Test                   |
| Reporting        | Allure Report                     |
| Observability    | Langfuse                          |
| AI Analysis      | Groq (llama-3.1-8b + llama-3.3-70b) |
| LLM Evaluation   | DeepEval                          |
| CI/CD            | GitHub Actions + GitLab CI        |

## Project Structure

| Path | Description |
|---|---|
| `config/env.ts` | BASE_URL, API_URL, HEADLESS, credentials |
| `tests/fixtures/baseTest.ts` | Extended test with page fixtures |
| `tests/fixtures/testData.ts` | Test data (Data-Driven) |
| `tests/pages/base.page.ts` | Base class with `open()`, inherited by all pages |
| `tests/pages/login.page.ts` | Sign-in flow |
| `tests/pages/signup.page.ts` | Sign-up flow |
| `tests/pages/main.page.ts` | Search, subscribe, pricing, support |
| `tests/specs/github.spec.ts` | UI E2E tests (`@smoke` / `@regression`) |
| `tests/specs/api_petstore.spec.ts` | API tests (`@api` / `@smoke`) |
| `tests/specs/accessibility.spec.ts` | Accessibility tests WCAG 2.1 AA (`@a11y`) |
| `tests/specs/contract.spec.ts` | API contract tests - response structure validation (`@contract`) |
| `tests/fixtures/langfuseBaseTest.ts` | Combined fixture: Langfuse tracing + page objects |
| `helpers/resilientLocator.ts` | Self-healing locator with fallback strategies |
| `helpers/langfuseTestHelper.ts` | Langfuse tracing class |
| `helpers/langfuseFixture.ts` | Playwright fixture with auto tracing |
| `playwright.config.ts` | Playwright configuration |
| `.env` | Local env vars - not committed |
| `.env.example` | Template for `.env` |
| `ai-pipeline/parser.py` | Parses test-results.json → failures_dataset.json |
| `ai-pipeline/run_pipeline.py` | Bot + Judge analysis → Langfuse scores |
| `ai-pipeline/requirements.txt` | Python dependencies |

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Install Playwright browsers**

```bash
npx playwright install chromium
```

**3. Create `.env` file in project root**

```
BASE_URL=https://github.com
API_URL=https://petstore.swagger.io/v2
TEST_USER_EMAIL=your_email@example.com
TEST_USER_PASSWORD=your_password
HEADLESS=false
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com
GROQ_API_KEY=gsk_...
```

## Running Tests

```bash
npm run test             # all tests
npm run test:smoke       # @smoke only
npm run test:regression  # @regression only
npm run test:api         # @api only
npm run test:a11y        # @a11y only
npm run test:contract    # @contract only
```

## Allure Report

```bash
npm run report:generate  # generate HTML report
npm run report           # generate and open in browser
```

## CI/CD

The project supports two CI/CD platforms simultaneously.

### GitHub Actions (`.github/workflows/e2e-tests.yml`)

Triggers: push/PR to `main` or `develop`, daily cron at 06:00 UTC, manual trigger with tag filter.

Secrets: `Settings -> Secrets and variables -> Actions`

| Secret | Description |
|---|---|
| `STAGING_BASE_URL` | Target environment URL |
| `TEST_USER_EMAIL` | Test user credentials |
| `TEST_USER_PASSWORD` | Test user credentials |
| `LANGFUSE_PUBLIC_KEY` | Langfuse project public key |
| `LANGFUSE_SECRET_KEY` | Langfuse project secret key |
| `LANGFUSE_HOST` | Langfuse host URL |
| `GROQ_API_KEY` | Groq API key (AI pipeline - bot + judge) |
| `QASE_TESTOPS_API_TOKEN` | Qase TMS token |

### GitLab CI (`.gitlab-ci.yml`)

Triggers: push to `main` or `develop`, Merge Request, manual trigger via UI.
Cron schedule: `Build -> Pipeline schedules -> New schedule`

Secrets: `Settings -> CI/CD -> Variables` (enable Masked for sensitive values)

Same secrets as GitHub Actions above.

## Self-Healing Locators

`ResilientLocator` tries multiple selector strategies before failing. Applied to Sign In, Sign Up, Subscribe buttons.
If primary breaks after UI change - test recovers via fallback and logs a warning for the team to update the selector.

## Observability

Tests are traced via Langfuse. Each test run creates a trace with spans and scores.

Scores per test:
- `test-success` - 1 if passed, 0 if failed
- `test-performance` - score based on duration (1.0 under 5s → 0.2 over 60s)

Failed tests are analyzed by the AI pipeline (see below) - scores `hallucination`, `relevancy`, `audit-passed` are written to the same Langfuse project.

Dashboard: https://cloud.langfuse.com

## AI Failure Analysis Pipeline

After a test run, failed tests can be automatically analyzed by an AI pipeline located in `ai-pipeline/`.

### How it works

```
npx playwright test → test-results.json
        ↓
parser.py extracts failed tests → failures_dataset.json
        ↓
Bot (llama-3.1-8b-instant) analyzes each failure → Langfuse trace
        ↓
Judge (llama-3.3-70b-versatile) evaluates bot quality via DeepEval
        ↓
Scores written to Langfuse: hallucination / relevancy / audit-passed
```

### Bot output per failure

- **FAILURE TYPE** - `locator_issue` / `timing_issue` / `environment_issue` / `real_bug` / `test_data_issue`
- **ROOT CAUSE** - brief explanation
- **IS REAL BUG** - yes / no
- **CONFIDENCE** - low / medium / high
- **RECOMMENDED ACTION** - next step for QA engineer

### Running locally

```bash
# activate Python venv with dependencies
source path/to/venv/bin/activate

# parse failures from last test run
python ai-pipeline/parser.py test-results.json

# run AI analysis
python ai-pipeline/run_pipeline.py
```

### CI/CD

Workflow: `.github/workflows/ai-analysis.yml` - manual trigger only (`workflow_dispatch`).

All required secrets are listed in the CI/CD section above.
