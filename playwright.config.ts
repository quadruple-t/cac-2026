import { defineConfig, devices } from "@playwright/test";

// Next's dev server loads .env.local itself, but the Playwright test runner
// is a separate process and needs these vars (E2E_TEST_EMAIL, etc.) directly.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (e.g. CI, where secrets are injected as real env vars).
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "public",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["landing.spec.ts", "about.spec.ts", "auth.spec.ts", "proxy-redirects.spec.ts"],
    },
    {
      name: "authenticated",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      testMatch: [
        "dashboard.spec.ts",
        "checklist.spec.ts",
        "deadlines.spec.ts",
        "fema.spec.ts",
        "conversational.spec.ts",
      ],
      dependencies: ["setup"],
    },
  ],
});
