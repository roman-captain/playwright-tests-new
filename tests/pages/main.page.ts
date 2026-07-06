import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ResilientLocator } from '../../helpers/resilientLocator';

export class MainPage extends BasePage {
  // Subscribe – ResilientLocator
  private resilientSubscribeBtn: ResilientLocator;
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

    this.resilientSubscribeBtn = new ResilientLocator(page, 'Subscribe button', [
      { type: 'css', value: 'a[href*="newsletter"]' },                    // primary (matches /newsletter and absolute URL)
      { type: 'css', value: 'a[class*="Newsletter-module__cta"]' },       // fallback 1 (Primer Brand CTA, hash-stable prefix)
      { type: 'role', value: 'link', name: 'Subscribe' },                 // fallback 2
    ]);
    this.subscribeHeadTitle = page.locator('h1:has-text("Get our developer newsletter")');
    this.fieldWorkEmail = page.locator('#form-field-emailAddress');
    this.fieldCountry = page.locator('#form-field-country');
    this.checkboxPrivacy = page.locator('[viewBox="0 0 100 100"]');
    this.successSubcribeTitle = page.locator('#hero-section-brand-heading');
    this.finalSubscribeBtn = page.getByRole('button', { name: 'Subscribe' });

    this.fieldSearch = page.locator('button.header-search-button');
    this.fieldRequest = page.locator('#query-builder-test');
    this.firstArtLink = page.locator('.search-title a').first();

    this.pricingBtn = page.getByRole('link', { name: 'Pricing', exact: true }).first();
    this.pricingHeader = page.locator('h1.h2-mktg');
    this.compareFeaturesLink = page.locator('a[href="#compare-features"]');
    this.compareFeaturesTitle = page.locator('h1.h1');

    this.serviceTermsButton = page.locator('a[href="/site/terms"]');
    this.supportLink = page.locator('a[href="https://support.github.com/"]');
    this.supportTitle = page.locator('h2[class*="Heading-module__Heading"]');
  }

  async clickSubscribeBtn() {
    const btn = await this.resilientSubscribeBtn.find();
    await btn.click();
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
