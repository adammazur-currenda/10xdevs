/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { CreateAuditPage } from "./pages/CreateAuditPage";

// Read environment variables
const username = process.env.E2E_USERNAME ?? "";
const password = process.env.E2E_PASSWORD ?? "";

interface TestFixtures {
  loginPage: LoginPage;
  createAuditPage: CreateAuditPage;
}

const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  createAuditPage: async ({ page }, use) => {
    await use(new CreateAuditPage(page));
  },
});

// Force tests to run in sequence
test.describe.configure({ mode: "serial" });

test.describe("Create Audit Flow", () => {
  test.beforeAll(() => {
    if (!username || !password) {
      throw new Error("E2E_USERNAME or E2E_PASSWORD environment variables are not set.");
    }
  });

  // Wykonaj logowanie przed każdym testem
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(username, password);
    // Verify successful login
    await expect(loginPage.page).toHaveURL("/audits");
  });

  test("1. should create a new audit successfully", async ({ createAuditPage }) => {
    // Navigate to create audit page
    await createAuditPage.goto();

    // Create a new audit with valid data
    const orderNumber = `TEST-${Date.now()}`;
    const protocol = "A".repeat(1000); // Minimum valid protocol length
    const description = "Test audit description";

    await createAuditPage.createAudit(orderNumber, protocol, description);
    await createAuditPage.expectSuccessfulCreation();
  });

  test("2. should show validation error for invalid order number", async ({ createAuditPage }) => {
    await createAuditPage.goto();

    // Test with invalid order number (too short)
    await createAuditPage.createAudit("A", "Valid protocol content".repeat(50));
    await createAuditPage.expectValidationError("orderNumber");
  });

  test("3. should show validation error for invalid protocol", async ({ createAuditPage }) => {
    await createAuditPage.goto();

    // Test with invalid protocol (too short)
    await createAuditPage.createAudit("TEST-123", "Too short");
    await createAuditPage.expectValidationError("protocol");
  });

  test("4. should handle network errors gracefully", async ({ createAuditPage, context }) => {
    await createAuditPage.goto();

    // Prepare valid data
    const orderNumber = `TEST-${Date.now()}`;
    const protocol = "A".repeat(1000);

    // Disable network before submitting
    await context.setOffline(true);

    // Try to create audit
    await createAuditPage.createAudit(orderNumber, protocol);

    // Verify error message
    const errorMessage = createAuditPage.page.getByText("Failed to fetch");
    await expect(errorMessage).toBeVisible();

    // Re-enable network
    await context.setOffline(false);
  });
});
