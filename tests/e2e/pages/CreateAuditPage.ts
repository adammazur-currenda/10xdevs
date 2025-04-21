import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export class CreateAuditPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  get form() {
    return this.page.getByTestId("create-audit-form");
  }

  get orderNumberInput() {
    return this.page.getByTestId("audit-order-number-input");
  }

  get descriptionInput() {
    return this.page.getByTestId("audit-description-input");
  }

  get protocolInput() {
    return this.page.getByTestId("audit-protocol-input");
  }

  get saveButton() {
    return this.page.getByTestId("save-audit-button");
  }

  get feedback() {
    return this.page.getByTestId("audit-form-feedback");
  }

  // Actions
  async goto() {
    await this.page.goto("/audits/new");
    // Wait for the form to be ready
    await this.form.waitFor({ state: "visible" });
    await this.orderNumberInput.waitFor({ state: "visible" });
  }

  async createAudit(orderNumber: string, protocol: string, description?: string) {
    // Wait for input to be ready and clear any existing value
    await this.orderNumberInput.waitFor({ state: "visible" });
    await this.page.waitForSelector('[data-test-id="audit-order-number-input"]:not([disabled])');
    await this.orderNumberInput.clear();
    await this.orderNumberInput.click();
    await this.orderNumberInput.fill(orderNumber);

    // Explicitly wait for the value to be set
    await expect(async () => {
      const value = await this.orderNumberInput.inputValue();
      expect(value).toBe(orderNumber);
    }).toPass({ timeout: 5000 });

    if (description) {
      await this.descriptionInput.waitFor({ state: "visible" });
      await this.page.waitForSelector('[data-test-id="audit-description-input"]:not([disabled])');
      await this.descriptionInput.clear();
      await this.descriptionInput.click();
      await this.descriptionInput.fill(description);
      await expect(this.descriptionInput).toHaveValue(description);
    }

    await this.protocolInput.waitFor({ state: "visible" });
    await this.page.waitForSelector('[data-test-id="audit-protocol-input"]:not([disabled])');
    await this.protocolInput.clear();
    await this.protocolInput.click();
    await this.protocolInput.fill(protocol);
    await expect(this.protocolInput).toHaveValue(protocol);

    await this.saveButton.click();
  }

  // Assertions
  async expectSuccessfulCreation() {
    // Wait for navigation to edit page
    await this.page.waitForURL(/\/audits\/edit\/[a-zA-Z0-9-]+/, { timeout: 10000 });
    // Verify the URL after navigation
    await expect(this.page.url()).toMatch(/\/audits\/edit\/[a-zA-Z0-9-]+/);
  }

  async expectValidationError(field: "orderNumber" | "protocol") {
    if (field === "orderNumber") {
      const error = this.page.getByText("Order number must be between 2 and 20 characters");
      await expect(error).toBeVisible();
    } else if (field === "protocol") {
      const error = this.page.getByText("Protocol must be between 1000 and 10000 characters");
      await expect(error).toBeVisible();
    }
  }
}
