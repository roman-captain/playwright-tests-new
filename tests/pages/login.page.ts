import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ResilientLocator } from '../../helpers/resilientLocator';

export class LoginPage extends BasePage {
  readonly loginInField: Locator;
  readonly passwordInField: Locator;
  readonly loginSignInButton: Locator;
  readonly signInPageTitle: Locator;

  // ResilientLocator
  private resilientSignInButton: ResilientLocator;

  constructor(page: Page) {
    super(page);
    this.loginInField = page.locator('#login_field');
    this.passwordInField = page.locator('#password');
    this.loginSignInButton = page.locator('[value="Sign in"]');
    this.signInPageTitle = page.locator('h1:has-text("Sign in to GitHub")');

    this.resilientSignInButton = new ResilientLocator(page, 'Sign In button', [
      { type: 'css', value: '.HeaderMenu-link--sign-in' },     // primary
      { type: 'css', value: 'a[href="/login"]' },              // fallback 1
      { type: 'role', value: 'link', name: 'Sign in' },         // fallback 2
    ]);
  }

  async clickOnSignInButton() {
    const btn = await this.resilientSignInButton.find();
    await btn.click();
  }
  async inputLoginInField(value: string) { await this.loginInField.fill(value); }
  async inputPasswordInField(value: string) { await this.passwordInField.fill(value); }
  async clickLoginSignInButton() { await this.loginSignInButton.click(); }
}
