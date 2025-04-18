import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/home-page";

test.describe("Home Page", () => {
  test("should load the home page successfully", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(page).toHaveTitle(/10x/);
    await expect(homePage.heading).toBeVisible();
  });
});
