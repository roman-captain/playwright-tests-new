# Changelog

## [feature/llm-judge] - 2026-05-06

### Added

- `helpers/langfuseTestHelper.ts` - added `evaluateWithLLM()` private method
  - automatically called in `endTestTrace()` when test fails
  - sends failed test name + error to Gemini API
  - writes score `llm-bug-detector` (1 = real bug, 0 = test issue) to Langfuse trace
  - uses model `gemini-2.5-flash-lite` (free tier: 15 RPM, 1000 req/day)
  - silent fail — LLM error never breaks test run

### Changed

- `.github/workflows/e2e-tests.yml` - added `GEMINI_API_KEY` secret to CI environment

### Setup required

Add to `.env`:
```
GEMINI_API_KEY=AIza...
```

Add to GitHub Secrets: `GEMINI_API_KEY`

Get free API key at: aistudio.google.com

---

## [feature/langfuse-integration] - 2026-05-06

### Added

- `helpers/langfuseTestHelper.ts` - LangfuseTestHelper class with methods for tracing test execution
  - `startTestTrace()` - starts trace per test with metadata (browser, env, tags, file, line)
  - `trackStep()` - tracks individual test steps with input/output
  - `trackApiRequest()` - tracks API calls with method, URL, status, response time
  - `trackPageNavigation()` - tracks page navigation with load time
  - `trackFormInteraction()` - tracks form inputs and submissions
  - `trackAssertion()` - tracks assertions with expected vs actual values
  - `endTestTrace()` - ends trace, sends scores: test-success (0 or 1) and test-performance (0.2-1.0)

- `helpers/langfuseFixture.ts` - Playwright fixture that wraps base test with auto tracing
  - auto `startTestTrace` before each test
  - auto `endTestTrace` after each test

- `tests/fixtures/langfuseBaseTest.ts` - combined fixture: langfuse tracing + page objects
  - extends langfuseFixture with LoginPage, SignupPage, MainPage
  - single import point for all tests

### Changed

- `tests/specs/github.spec.ts` - import changed from `baseTest` to `langfuseBaseTest`
- `tests/specs/api_petstore.spec.ts` - import changed from `@playwright/test` to `langfuseBaseTest`
- `.github/workflows/e2e-tests.yml` - added Langfuse secrets to CI environment
  - `LANGFUSE_PUBLIC_KEY`
  - `LANGFUSE_SECRET_KEY`
  - `LANGFUSE_HOST`
- `package.json` - added `langfuse` package

### How it works

Each test execution creates one trace in Langfuse dashboard.
Inside the trace - spans for each tracked step.
After test completion - automatic scores are sent:
- `test-success`: 1 if passed, 0 if failed
- `test-performance`: score based on duration (1.0 under 5s, 0.8 for 5-10s, 0.6 for 10-30s, 0.4 for 30-60s, 0.2 over 60s)

### Setup required

Add to `.env`:
```
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

Add to GitHub Secrets: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`
