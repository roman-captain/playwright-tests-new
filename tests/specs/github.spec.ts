import { test, expect } from '../fixtures/langfuseBaseTest';
import { qase } from 'playwright-qase-reporter';
import { testData } from '../fixtures/testData';

test.describe('Navigation on GitHub.com', () => {

  test('should sign up github.com @smoke', async ({ signupPage }) => {
    qase.id(5);
    qase.title('Sign up on GitHub');
    qase.fields({ severity: 'critical', priority: 'high' });
    qase.tags('ui', 'smoke');

    await signupPage.open('/');

    await signupPage.clickOnSignUpButton();
    await expect(signupPage.signUpHeader).toHaveText('Create your free account');

    await signupPage.inputEmailField(testData.signUp.email);
    await signupPage.inputPasswordField(testData.signUp.password);
    await signupPage.inputUsernameField(testData.signUp.username);
    await signupPage.chooseCountry(testData.signUp.country);
    await signupPage.clickCheckboxEmailLink();

    await expect(signupPage.createAccountButton).toBeEnabled();
    await signupPage.createAccountButton.click();
  });

  test('should sign in github.com @smoke', async ({ loginPage }) => {
    qase.id(6);
    qase.title('Sign in on GitHub');
    qase.fields({ severity: 'critical', priority: 'high' });
    qase.tags('ui', 'smoke');

    await loginPage.open('/');

    await loginPage.clickOnSignInButton();
    await expect(loginPage.signInPageTitle).toHaveText('Sign in to GitHub');

    await loginPage.inputLoginInField(testData.signIn.email);
    await loginPage.inputPasswordInField(testData.signIn.password);
    await loginPage.clickLoginSignInButton();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search in github.com @smoke', async ({ mainPage, page }) => {
    qase.id(7);
    qase.title('Search on GitHub');
    qase.fields({ severity: 'major', priority: 'high' });
    qase.tags('ui', 'smoke');

    await mainPage.clickOnFieldSearch();
    await mainPage.inputFieldRequest(testData.search.query);

    await page.waitForURL(/search/);
    await expect(mainPage.firstArtLink).toBeVisible();
  });

  test('should subscribe in github.com @regression', async ({ mainPage }) => {
    qase.id(8);
    qase.title('Subscribe to developer newsletter');
    qase.fields({ severity: 'normal', priority: 'medium' });
    qase.tags('ui', 'regression');

    await mainPage.clickSubscribeBtn();

    await expect(mainPage.subscribeHeadTitle).toHaveText('Get our developer newsletter');
    await mainPage.inputFieldWorkEmail(testData.subscribe.email);
    await mainPage.selectCountry(testData.subscribe.country);
    await mainPage.checkboxPrivacy.click();
    await mainPage.finalSubscribeBtn.click();

    await expect(mainPage.successSubcribeTitle).toHaveText(testData.subscribe.successText, { timeout: 10000 });
  });

  test('should check pricing on github.com @regression', async ({ mainPage, page }) => {
    qase.id(9);
    qase.title('Check pricing page');
    qase.fields({ severity: 'normal', priority: 'medium' });
    qase.tags('ui', 'regression');

    await mainPage.pricingBtn.click();

    await expect(mainPage.pricingHeader).toHaveText(testData.pricing.headerText);
    await expect(page).toHaveTitle(/Pricing/);

    await mainPage.compareFeaturesLink.click();
    await expect(mainPage.compareFeaturesTitle).toHaveText(testData.pricing.compareFeaturesText);
  });

  test('should find support on github.com @regression', async ({ page, signupPage }) => {
    qase.id(10);
    qase.title('Find support link from Terms page');
    qase.fields({ severity: 'minor', priority: 'medium' });
    qase.tags('ui', 'regression');

    await signupPage.clickOnSignUpButton();

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('a[href="/site/terms"]').click(),
    ]);

    await expect(newPage).toHaveURL(testData.support.termsUrlPattern);

    const supportLink = newPage.locator('a[href="https://support.github.com/"]').first();
    await supportLink.click();

    const supportTitle = newPage.locator('h2[class*="Heading-module__Heading"]');
    await expect(supportTitle).toHaveText(testData.support.supportTitle);
  });
});
