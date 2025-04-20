import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-button");
  }

  async goto() {
    await this.page.goto("/auth/login", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    const currentUrl = this.page.url();
    if (!currentUrl.includes("/auth/login")) {
      throw new Error(`Expected URL to contain /auth/login, but got ${currentUrl}`);
    }
  }

  async login(email: string, password: string) {
    await this.emailInput.waitFor({ state: "visible" });
    await this.passwordInput.waitFor({ state: "visible" });

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    await this.submitButton.click();
  }
}
