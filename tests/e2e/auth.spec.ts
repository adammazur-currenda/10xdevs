import { test as base, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

// Odczytaj zmienne środowiskowe
const username = process.env.E2E_USERNAME ?? "";
const password = process.env.E2E_PASSWORD ?? "";

// Rozszerzamy test fixture o loginPage
interface TestFixtures {
  loginPage: LoginPage;
}

const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, runTest) => {
    const loginPage = new LoginPage(page);
    await runTest(loginPage);
  },
});

// Wymuszamy sekwencyjne wykonywanie testów w tej grupie
test.describe.configure({ mode: "serial" });

test.describe("Authentication", () => {
  test.beforeAll(() => {
    if (!username || !password) {
      throw new Error("E2E_USERNAME or E2E_PASSWORD environment variables are not set.");
    }
  });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("should handle network errors gracefully", async ({ loginPage, context }) => {
    // Upewniamy się, że strona jest załadowana przed wyłączeniem sieci
    await expect(loginPage.emailInput).toBeVisible();

    // Wyłączamy sieć
    await context.setOffline(true);

    // Próbujemy się zalogować
    await loginPage.login(username, password);

    const errorMessage = loginPage.page.getByText("Failed to fetch");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    await context.setOffline(false);
  });

  test("should allow a user to log in successfully", async ({ loginPage }) => {
    await loginPage.login(username, password);
    await expect(loginPage.page).toHaveURL("/audits", { timeout: 10000 });
  });

  test("should show error for invalid credentials", async ({ loginPage }) => {
    await loginPage.login(username, "wrong_password");

    const errorMessage = loginPage.page.getByText("Invalid login credentials");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(loginPage.page).toHaveURL("/auth/login");
  });

  test("should show error for non-existent user", async ({ loginPage }) => {
    await loginPage.login("nonexistent@example.com", password);

    const errorMessage = loginPage.page.getByText("Invalid login credentials");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(loginPage.page).toHaveURL("/auth/login");
  });

  test("should require all fields", async ({ loginPage }) => {
    await loginPage.submitButton.click();

    const emailInput = loginPage.page.getByTestId("login-email-input");
    const passwordInput = loginPage.page.getByTestId("login-password-input");

    await expect(emailInput).toBeEmpty();
    await expect(passwordInput).toBeEmpty();
    await expect(loginPage.page).toHaveURL("/auth/login");
  });

  test("should maintain form state after failed login", async ({ loginPage }) => {
    const testEmail = "test@example.com";
    const testPassword = "wrong_password";

    await loginPage.emailInput.fill(testEmail);
    await loginPage.passwordInput.fill(testPassword);
    await loginPage.submitButton.click();

    await expect(loginPage.emailInput).toHaveValue(testEmail, { timeout: 5000 });
    await expect(loginPage.passwordInput).toHaveValue(testPassword, { timeout: 5000 });
  });

  test("should handle multiple login attempts", async ({ loginPage }) => {
    await loginPage.login("wrong@example.com", "wrong_password");
    await expect(loginPage.page.getByText("Invalid login credentials")).toBeVisible({ timeout: 5000 });

    await loginPage.login("another@example.com", "wrong_password");
    await expect(loginPage.page.getByText("Invalid login credentials")).toBeVisible({ timeout: 5000 });

    await loginPage.login(username, password);
    await expect(loginPage.page).toHaveURL("/audits", { timeout: 10000 });
  });
});
