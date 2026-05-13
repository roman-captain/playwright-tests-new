import json
import re
import sys
from pathlib import Path


def strip_ansi(text: str) -> str:
    return re.sub(r'\x1b\[[0-9;]*m', '', text)


def parse_playwright_results(report_path: str = "../test-results.json") -> list[dict]:
    path = Path(report_path)
    if not path.exists():
        print(f"ERROR: {report_path} not found. Run Playwright tests first.")
        sys.exit(1)

    with open(path) as f:
        report = json.load(f)

    failures = []

    for suite in report.get("suites", []):
        for sub in suite.get("suites", []):
            for spec in sub.get("specs", []):
                for test in spec.get("tests", []):
                    for result in test.get("results", []):
                        if result.get("status") == "failed":
                            error = result.get("error", {})
                            message = error.get("message", "Unknown error")
                            lines = [strip_ansi(l.strip()) for l in message.split("\n") if strip_ansi(l.strip())]
                            clean_message = " | ".join(lines[:3])

                            failures.append({
                                "id": f"failure_{len(failures) + 1:03d}",
                                "test_name": spec.get("title", "Unknown test"),
                                "error": clean_message,
                                "context": f"Suite: {sub.get('title', '')}. File: {suite.get('title', '')}."
                            })

    return failures


if __name__ == "__main__":
    report_path = sys.argv[1] if len(sys.argv) > 1 else "../test-results.json"
    failures = parse_playwright_results(report_path)

    if not failures:
        print("No failures found in test-results.json. Nothing to analyze.")
        sys.exit(0)

    output_path = Path("failures_dataset.json")
    with open(output_path, "w") as f:
        json.dump(failures, f, indent=2)

    print(f"Parser: found {len(failures)} failure(s) → saved to {output_path}")
    for f in failures:
        print(f"  [{f['id']}] {f['test_name']}")
