import { type Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async open(path: string = '') {
    await this.page.goto(path);
    await this.dismissCookieBanner();
  }

  private async dismissCookieBanner() {
    const acceptBtn = this.page.locator('#wcpConsentBannerCtrl button:has-text("Accept")');
    const isVisible = await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) await acceptBtn.click();
  }
}
