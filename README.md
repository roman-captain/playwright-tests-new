# playwright-tests-new

Automation test suite for [github.com](https://github.com) — AQA internship practice project.

Built to Wiki standard

## Tech Stack

| Component      | Technology              |
|----------------|-------------------------|
| Language       | TypeScript              |
| Test Framework | Playwright              |
| Test Runner    | Playwright Test         |
| Reporting      | Allure Report           |
| CI/CD          | GitHub Actions          |

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
```

## Running Tests

```bash
npm run test             # all tests
npm run test:smoke       # @smoke only
npm run test:regression  # @regression only
npm run test:api         # @api only
```

## Allure Report

```bash
npm run report:generate  # generate HTML report
npm run report           # generate and open in browser
```

## CI/CD

Tests run automatically on:
- Push / PR to `main` or `develop`
- Daily at 06:00 UTC (cron)
- Manual trigger via GitHub Actions UI (with optional tag filter)

Required GitHub Secrets:

| Secret | Description |
|---|---|
| `STAGING_BASE_URL` | Target environment URL |
| `TEST_USER_EMAIL` | Test user credentials |
| `TEST_USER_PASSWORD` | Test user credentials |
