import type { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.navLinks = page.getByRole("navigation").getByRole("link");
  }

  async goto() {
    await this.page.goto("/");
  }

  async clickNavLink(linkText: string) {
    await this.navLinks.filter({ hasText: linkText }).click();
  }
}
