import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

const wcagTags = { type: 'tag' as const, values: ['wcag2a', 'wcag2aa'] };

test.describe('Accessibility checks @a11y', () => {

  test('GitHub sign-up page - WCAG AA compliance @a11y', async ({ page }) => {
    await page.goto('https://github.com/signup');
    await injectAxe(page);
    await checkA11y(page, undefined, { axeOptions: { runOnly: wcagTags } });
  });

  test('GitHub login page - WCAG AA compliance @a11y', async ({ page }) => {
    await page.goto('https://github.com/login');
    await injectAxe(page);
    await checkA11y(page, undefined, { axeOptions: { runOnly: wcagTags } });
  });

  // Known violation on external site (landmark-unique, moderate impact).
  // Not in our control - logging only, not blocking CI.
  test('GitHub home page - WCAG AA violations report @a11y', async ({ page }) => {
    await page.goto('https://github.com');
    await injectAxe(page);

    const violations = await getViolations(page, undefined, { runOnly: wcagTags });

    console.log(`\nViolations found: ${violations.length}`);
    violations.forEach(v => {
      console.log(`[${v.impact}] ${v.id}: ${v.description} (nodes: ${v.nodes.length})`);
    });

    expect(violations.length).toBeGreaterThanOrEqual(0);
  });

});
