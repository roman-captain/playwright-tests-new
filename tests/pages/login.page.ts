import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly signInButton: Locator;
  readonly loginInField: Locator;
  readonly passwordInField: Locator;
  readonly loginSignInButton: Locator;
  readonly signInPageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.signInButton = page.locator('.HeaderMenu').locator('a[href="/login"]');
    this.loginInField = page.locator('#login_field');
    this.passwordInField = page.locator('#password');
    this.loginSignInButton = page.locator('[value="Sign in"]');
    this.signInPageTitle = page.locator('h1:has-text("Sign in to GitHub")');
  }

  async clickOnSignInButton() { await this.signInButton.click(); }
  async inputLoginInField(value: string) { await this.loginInField.fill(value); }
  async inputPasswordInField(value: string) { await this.passwordInField.fill(value); }
  async clickLoginSignInButton() { await this.loginSignInButton.click(); }
}
