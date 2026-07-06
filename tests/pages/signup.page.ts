import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ResilientLocator } from '../../helpers/resilientLocator';

export class SignupPage extends BasePage {
  readonly signUpHeader: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly usernameField: Locator;
  readonly countryButton: Locator;
  readonly checkboxEmailLink: Locator;
  readonly createAccountButton: Locator;

  // ResilientLocator
  private resilientSignUpButton: ResilientLocator;

  constructor(page: Page) {
    super(page);
    this.signUpHeader = page.locator('h1.signups-rebrand__container-h1');

    this.resilientSignUpButton = new ResilientLocator(page, 'Sign Up button', [
      { type: 'css', value: 'a[href*="/signup"]' },            // primary
      { type: 'css', value: '.HeaderMenu-link--sign-up' },     // fallback 1
      { type: 'role', value: 'link', name: 'Sign up' },         // fallback 2
    ]);
    this.emailField = page.locator('#email');
    this.passwordField = page.locator('#password');
    this.usernameField = page.locator('#login');
    this.countryButton = page.locator('#country-dropdown-panel-button');
    this.checkboxEmailLink = page.locator('[data-target="signups-marketing-consent-fields.marketingConsentCheckbox"]');
    // GitHub redesign (Jul 2026): data-target="signup-form.SignupButton" removed from DOM
    this.createAccountButton = page.getByRole('button', { name: 'Create account' });
  }

  async clickOnSignUpButton() {
    const btn = await this.resilientSignUpButton.find();
    await btn.click();
  }
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
