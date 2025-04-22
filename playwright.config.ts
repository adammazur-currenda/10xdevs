import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { existsSync } from "fs";

// Ładujemy zmienne środowiskowe z pliku .env.test tylko w środowisku lokalnym
if (!process.env.CI && existsSync(".env.test")) {
  const envResult = dotenv.config({ path: ".env.test" });
  if (envResult.error) {
    console.warn("Failed to load .env.test file:", envResult.error);
  }
}

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  workers: 1,
  fullyParallel: false,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Dodajemy zmienne środowiskowe do testów
    testIdAttribute: "data-test-id",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      },
    },
  ],

  // Konfiguracja serwera deweloperskiego
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
