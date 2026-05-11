# playwright-tests-new

Playwright E2E test suite — AQA internship practice project.

Built to Wiki standard

## Tech Stack

| Component      | Technology              |
|----------------|-------------------------|
| Language       | TypeScript              |
| Test Framework | Playwright              |
| Test Runner    | Playwright Test         |
| Reporting      | Allure Report           |
| Observability  | Langfuse                |
| CI/CD          | GitHub Actions + GitLab CI |

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
| `tests/fixtures/langfuseBaseTest.ts` | Combined fixture: Langfuse tracing + page objects |
| `helpers/langfuseTestHelper.ts` | Langfuse tracing class |
| `helpers/langfuseFixture.ts` | Playwright fixture with auto tracing |
| `helpers/` | Utility functions |
| `playwright.config.ts` | Playwright configuration |
| `.env` | Local env vars — not committed |
| `.env.example` | Template for `.env` |

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
GEMINI_API_KEY=AIza...
```

## Running Tests

```bash
npm run test             # all tests
npm run test:smoke       # @smoke only
npm run test:regression  # @regression only
npm run test:api         # @api only
npm run test:a11y        # @a11y only
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
| `QASE_TESTOPS_API_TOKEN` | Qase TMS token |
| `GEMINI_API_KEY` | Gemini API key for LLM Judge |

### GitLab CI (`.gitlab-ci.yml`)

Triggers: push to `main` or `develop`, Merge Request, manual trigger via UI.
Cron schedule: `Build -> Pipeline schedules -> New schedule`

Secrets: `Settings -> CI/CD -> Variables` (enable Masked for sensitive values)

Same secrets as GitHub Actions above.

## Observability

Tests are traced via Langfuse. Each test run creates a trace with spans and scores.

Scores per test:
- `test-success` - 1 if passed, 0 if failed
- `test-performance` - score based on duration (1.0 under 5s, 0.8 for 5-10s, 0.6 for 10-30s, 0.4 for 30-60s, 0.2 over 60s)
- `llm-bug-detector` - AI score for failed tests: 1 = real product bug, 0 = test issue (powered by Gemini)

Dashboard: https://cloud.langfuse.com
