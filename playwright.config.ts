import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Ładujemy zmienne środowiskowe z pliku .env.test przed jakąkolwiek konfiguracją
const envResult = dotenv.config({ path: ".env.test" });

if (envResult.error) {
  throw new Error("Failed to load .env.test file");
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
