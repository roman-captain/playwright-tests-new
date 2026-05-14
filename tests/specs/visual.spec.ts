import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression - GitHub Pages', () => {

  test('login page visual snapshot @visual', async ({ page }) => {
    await page.goto('https://github.com/login');
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'GitHub - Login Page');
  });

  test('pricing page visual snapshot @visual', async ({ page }) => {
    await page.goto('https://github.com/pricing');
    await page.waitForLoadState('networkidle');
    await percySnapshot(page, 'GitHub - Pricing Page');
  });

  test('homepage visual snapshot @visual', async ({ page }) => {
    await page.goto('https://github.com');
    await page.waitForLoadState('load');
    await percySnapshot(page, 'GitHub - Homepage');
  });

});
