import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SignupPage } from '../pages/signup.page';
import { MainPage } from '../pages/main.page';

type MyPages = {
  loginPage: LoginPage;
  signupPage: SignupPage;
  mainPage: MainPage;
};

export const test = base.extend<MyPages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  mainPage: async ({ page }, use) => {
    await use(new MainPage(page));
  },
});

export { expect } from '@playwright/test';
