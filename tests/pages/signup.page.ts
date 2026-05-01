import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class SignupPage extends BasePage {
  readonly signUpButton: Locator;
  readonly signUpHeader: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly usernameField: Locator;
  readonly countryButton: Locator;
  readonly checkboxEmailLink: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signUpButton = page.locator('.HeaderMenu-link--sign-up');
    this.signUpHeader = page.locator('h1.signups-rebrand__container-h1');
    this.emailField = page.locator('#email');
    this.passwordField = page.locator('#password');
    this.usernameField = page.locator('#login');
    this.countryButton = page.locator('#country-dropdown-panel-button');
    this.checkboxEmailLink = page.locator('.FormControl-checkbox');
    this.createAccountButton = page.locator('button[data-target="signup-form.SignupButton"]');
  }

  async clickOnSignUpButton() { await this.signUpButton.click(); }
  async inputEmailField(value: string) { await this.emailField.fill(value); }
  async inputPasswordField(value: string) { await this.passwordField.fill(value); }
  async inputUsernameField(value: string) { await this.usernameField.fill(value); }

  async chooseCountry(name: string) {
    await this.countryButton.click();
    const option = this.page.locator(`span:has-text("${name}")`);
    await option.click();
  }

  async clickCheckboxEmailLink() { await this.checkboxEmailLink.click(); }
}
