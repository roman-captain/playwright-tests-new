import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class MainPage extends BasePage {
  // Subscribe
  readonly subscribeBtn: Locator;
  readonly subscribeHeadTitle: Locator;
  readonly fieldWorkEmail: Locator;
  readonly fieldCountry: Locator;
  readonly checkboxPrivacy: Locator;
  readonly successSubcribeTitle: Locator;
  readonly finalSubscribeBtn: Locator;

  // Search
  readonly fieldSearch: Locator;
  readonly fieldRequest: Locator;
  readonly firstArtLink: Locator;

  // Pricing
  readonly pricingBtn: Locator;
  readonly pricingHeader: Locator;
  readonly compareFeaturesLink: Locator;
  readonly compareFeaturesTitle: Locator;

  // Support
  readonly serviceTermsButton: Locator;
  readonly supportLink: Locator;
  readonly supportTitle: Locator;

  constructor(page: Page) {
    super(page);

    this.subscribeBtn = page.locator('a[href="https://github.com/newsletter"]');
    this.subscribeHeadTitle = page.locator('h1:has-text("Get our developer newsletter")');
    this.fieldWorkEmail = page.locator('#form-field-emailAddress');
    this.fieldCountry = page.locator('#form-field-country');
    this.checkboxPrivacy = page.locator('[viewBox="0 0 100 100"]');
    this.successSubcribeTitle = page.locator('#hero-section-brand-heading');
    this.finalSubscribeBtn = page.locator('.Primer_Brand__Button-module__Button__text___Z3ocU');

    this.fieldSearch = page.locator('button.header-search-button');
    this.fieldRequest = page.locator('#query-builder-test');
    this.firstArtLink = page.locator('[data-testid="results-list"] a').first();

    this.pricingBtn = page.getByRole('link', { name: 'Pricing', exact: true }).first();
    this.pricingHeader = page.locator('h1.h2-mktg');
    this.compareFeaturesLink = page.locator('a[href="#compare-features"]');
    this.compareFeaturesTitle = page.locator('h1.h1');

    this.serviceTermsButton = page.locator('a[href="/site/terms"]');
    this.supportLink = page.locator('a[href="https://support.github.com/"]');
    this.supportTitle = page.locator('h2[class*="Heading-module__Heading"]');
  }

  async inputFieldWorkEmail(value: string) { await this.fieldWorkEmail.fill(value); }

  async selectCountry(countryName: string) {
    await this.fieldCountry.selectOption({ label: countryName });
  }

  async clickOnFieldSearch() { await this.fieldSearch.click(); }

  async inputFieldRequest(value: string) {
    await this.fieldRequest.fill(value);
    await this.page.keyboard.press('Enter');
  }
}
