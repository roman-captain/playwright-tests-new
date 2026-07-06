# Changelog

## [fix/github-redesign-locators] - 2026-07-06

### Fixed

- `tests/pages/signup.page.ts` - replaced dead `button[data-target="signup-form.SignupButton"]` with `getByRole('button', { name: 'Create account' })` – GitHub removed the data-target attribute in the signup redesign
- `tests/pages/main.page.ts` - Subscribe button: primary selector updated to `a[href*="newsletter"]` (href became relative), fallback 1 updated from removed `.btn-mktg` to Primer Brand class prefix `a[class*="Newsletter-module__cta"]`
- `tests/fixtures/testData.ts` - signUp data generated per run via `Date.now()` – GitHub now live-validates email/username availability and password leaks, static values kept "Create account" disabled (`data-disable-invalid`)

---

## [fix/test-stability] - 2026-05-14

### Fixed

- `tests/specs/visual.spec.ts` - replaced `networkidle` with `load` on homepage – `networkidle` never resolves on GitHub homepage due to continuous background requests
- `tests/specs/contract.spec.ts` - removed `name.length > 0` check – Petstore public API has pets with empty name, this is valid data not a contract violation
- `tests/pages/main.page.ts` - updated `firstArtLink` locator from `[data-testid="results-list"] a` to `.search-title a` – GitHub changed search results UI

---

## [feature/visual-regression-percy] - 2026-05-14

### Added

- `tests/specs/visual.spec.ts` - 3 visual regression tests with tag `@visual` via Percy
  - GitHub Login page snapshot
  - GitHub Pricing page snapshot
  - GitHub Homepage snapshot
- `package.json` - added `test:visual` script (`percy exec -- playwright test --grep @visual`)
- `@percy/cli` and `@percy/playwright` added to devDependencies
- `PERCY_TOKEN` added to GitHub Secrets

### How it works

Percy captures fullPage screenshots and uploads them to the Percy cloud. On first run baseline is created. On every subsequent run Percy compares new screenshots with baseline and shows visual diff in the dashboard. Runs automatically as part of the daily cron schedule.

Dashboard: percy.io

---

## [feature/slack-notifications] - 2026-05-14

### Added

- `.github/workflows/e2e-tests.yml` - Slack notification on CI failure via `slackapi/slack-github-action@v1.26.0`
  - sends message to `#aqa-ci-alerts` channel when tests fail
  - message includes branch name and link to failed pipeline run
- `SLACK_WEBHOOK_URL` added to GitHub Secrets

---

## [fix/contract-test-isolation] - 2026-05-14

### Fixed

- `tests/specs/contract.spec.ts` - added `beforeAll` to create pet before tests and `afterAll` to delete it after. Fixes 404 on `GET /pet/{id}` when running alongside other suites that delete the same pet id.

---

## [feature/contract-tests] - 2026-05-14

### Added

- `tests/specs/contract.spec.ts` - 5 contract tests with tag `@contract`
  - `GET /pet/{id}` - validates Pet response structure (id, name, status, photoUrls, optional category/tags)
  - `POST /pet` - validates created Pet response matches contract
  - `GET /pet/findByStatus` - validates each item in response array matches Pet contract
  - `GET /store/inventory` - validates inventory object contains only string keys and numeric values
  - `GET /pet/999999999` - validates error response structure (code, type, message)
- `package.json` - added `test:contract` script for running contract tests locally

### How it works

TypeScript interfaces define the expected API response structure. A shared `assertPetContract()` function validates field types and allowed enum values against the Petstore Swagger schema. If the backend renames a field or changes a type - the test fails before the frontend breaks.

```typescript
function assertPetContract(pet: PetContract) {
  expect(typeof pet.id, 'id must be a number').toBe('number');
  expect(typeof pet.name, 'name must be a string').toBe('string');
  expect(VALID_STATUSES, 'status must be one of the allowed values').toContain(pet.status);
  expect(Array.isArray(pet.photoUrls), 'photoUrls must be an array').toBe(true);
}
```

Run contract tests only:
```bash
npm run test:contract
```

---

## [feature/ai-failure-analysis] - 2026-05-13

### Added

- `ai-pipeline/parser.py` - parses Playwright `test-results.json`, extracts failed tests into `failures_dataset.json`
  - strips ANSI color codes from error messages
  - outputs structured JSON: id, test_name, error, context
- `ai-pipeline/run_pipeline.py` - AI analysis pipeline
  - Bot: `llama-3.1-8b-instant` (Groq) analyzes each failure, logs trace to Langfuse
  - Judge: `llama-3.3-70b-versatile` (Groq) evaluates bot quality via DeepEval
  - Scores written to Langfuse: `hallucination`, `relevancy`, `audit-passed`
- `ai-pipeline/requirements.txt` - Python dependencies: groq, deepeval, langfuse, python-dotenv
- `.github/workflows/ai-analysis.yml` - manual workflow (`workflow_dispatch`)
  - runs Playwright tests, parses failures, runs AI analysis in one job

### Changed

- `playwright.config.ts` - added JSON reporter (`test-results.json`)
- `README.md` - updated Tech Stack, Project Structure, Observability, added AI Pipeline section

---

## [feature/self-healing-locators] - 2026-05-12

### Added

- `helpers/resilientLocator.ts` - ResilientLocator class with multi-strategy fallback
  - tries each strategy in order until element is found
  - logs warning when primary selector fails and fallback is used
  - throws only when all strategies are exhausted

### Changed

- `tests/pages/login.page.ts` - signInButton converted to ResilientLocator (3 strategies)
- `tests/pages/signup.page.ts` - signUpButton converted to ResilientLocator (3 strategies)
- `tests/pages/main.page.ts` - subscribeBtn converted to ResilientLocator, added `clickSubscribeBtn()` method
- `tests/specs/github.spec.ts` - updated to use `mainPage.clickSubscribeBtn()`

### How it works

```typescript
new ResilientLocator(page, 'Sign In button', [
  { type: 'css',  value: 'a[href="/login"]' },          // primary
  { type: 'css',  value: '.HeaderMenu-link--sign-in' }, // fallback 1
  { type: 'role', value: 'link', name: 'Sign in' },     // fallback 2
])
```

When primary fails, CI logs:
```
⚠️ [ResilientLocator] "Sign In button" - primary broken! Recovered via fallback #1. Please update the selector.
```

---

## [feature/accessibility-tests] - 2026-05-11

### Added

- `tests/specs/accessibility.spec.ts` - 3 accessibility tests with tag `@a11y`
  - sign-up page: hard WCAG 2.1 AA check, fails if violations found
  - login page: hard WCAG 2.1 AA check, fails if violations found
  - home page: logs violations only, does not fail (known external violation, not in our control)
- `axe-playwright` package added to devDependencies

### How it works

Axe scans the page DOM and checks against WCAG 2.1 A and AA rules.
Run accessibility tests only:
```bash
npx playwright test --grep @a11y
```

---

## [feature/llm-judge] - 2026-05-06

### Added

- `helpers/langfuseTestHelper.ts` - added `evaluateWithLLM()` private method
  - automatically called in `endTestTrace()` when test fails
  - sends failed test name + error to Gemini API
  - writes score `llm-bug-detector` (1 = real bug, 0 = test issue) to Langfuse trace
  - uses model `gemini-2.5-flash-lite` (free tier: 15 RPM, 1000 req/day)
  - silent fail - LLM error never breaks test run

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
