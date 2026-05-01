import { test, expect } from '../fixtures/baseTest';
import { testData } from '../fixtures/testData';

test.describe('Navigation on GitHub.com', () => {

  test('should sign up github.com @smoke', async ({ signupPage }) => {
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
    await mainPage.clickOnFieldSearch();
    await mainPage.inputFieldRequest(testData.search.query);

    await page.waitForURL(/search/);
    await expect(mainPage.firstArtLink).toBeVisible();
  });

  test('should subscribe in github.com @regression', async ({ mainPage }) => {
    await mainPage.subscribeBtn.click();

    await expect(mainPage.subscribeHeadTitle).toHaveText('Get our developer newsletter');
    await mainPage.inputFieldWorkEmail(testData.subscribe.email);
    await mainPage.selectCountry(testData.subscribe.country);
    await mainPage.checkboxPrivacy.click();
    await mainPage.finalSubscribeBtn.click();

    await expect(mainPage.successSubcribeTitle).toHaveText(testData.subscribe.successText, { timeout: 10000 });
  });

  test('should check pricing on github.com @regression', async ({ mainPage, page }) => {
    await mainPage.pricingBtn.click();

    await expect(mainPage.pricingHeader).toHaveText(testData.pricing.headerText);
    await expect(page).toHaveTitle(/Pricing/);

    await mainPage.compareFeaturesLink.click();
    await expect(mainPage.compareFeaturesTitle).toHaveText(testData.pricing.compareFeaturesText);
  });

  test('should find support on github.com @regression', async ({ page, signupPage }) => {
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
