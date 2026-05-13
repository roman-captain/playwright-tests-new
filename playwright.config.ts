import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
    ['allure-playwright', {
      outputFolder: 'allure-results',
      suiteTitle: true,
    }],
    ['playwright-qase-reporter', {
      mode: process.env.QASE_MODE || 'off',
      testops: {
        api: { token: process.env.QASE_TESTOPS_API_TOKEN },
        project: 'GPT',
        uploadAttachments: true,
        run: { complete: true },
      },
    }],
  ],

  use: {
    baseURL: env.baseUrl,
    headless: env.headless,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
