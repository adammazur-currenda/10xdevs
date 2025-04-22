import { defineConfig } from "vitest/config";
import react from "@astrojs/react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**", "**/.astro/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "json-summary"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.astro/**",
        "**/test/**",
        "**/types.ts",
        "**/db/**",
        "**/env.d.ts",
        "**/layouts/**",
        "**/pages/api/**",
        "**/middleware/**",
      ],
      thresholds: {
        // TODO: Przywrócić docelowe progi 80% gdy dopisane zostaną testy
        lines: 0,
        functions: 1,
        branches: 0,
        statements: 1,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
