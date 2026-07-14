import { test as setup, expect } from "@playwright/test";

const AUTH_FILE = "e2e/.auth/user.json";

const REQUIRED_ENV_VARS = [
  "E2E_TEST_EMAIL",
  "E2E_TEST_PASSWORD",
  "NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN",
] as const;

setup("authenticate", async ({ page }) => {
  // Checked inside the test body (not at module scope) so that listing or
  // running unrelated projects doesn't fail just because this file loaded.
  for (const name of REQUIRED_ENV_VARS) {
    if (!process.env[name]) {
      throw new Error(
        `e2e/auth.setup.ts: missing required env var ${name}. Authenticated tests need a ` +
          "dedicated Firebase test account and a fixed App Check debug token registered in " +
          "Firebase Console > Build > App Check > Manage debug tokens. Set E2E_TEST_EMAIL, " +
          "E2E_TEST_PASSWORD, and NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN in .env.local. " +
          "See playwright.config.ts / e2e/auth.setup.ts for details.",
      );
    }
  }

  await page.goto("/sign-in");

  await page.getByLabel("Email").fill(process.env.E2E_TEST_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_TEST_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();

  const errorLocator = page.locator("p.text-sm.text-\\[\\#a13c2c\\]");

  await Promise.race([
    page.waitForURL("/dashboard", { timeout: 15_000 }),
    errorLocator.waitFor({ state: "visible", timeout: 15_000 }),
  ]);

  if (await errorLocator.isVisible().catch(() => false)) {
    const message = await errorLocator.textContent();
    throw new Error(
      `e2e/auth.setup.ts: sign-in failed with "${message}". Check that E2E_TEST_EMAIL/` +
        "E2E_TEST_PASSWORD are correct and the account exists in the Firebase project, and " +
        "that the fixed NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN value is registered in " +
        "Firebase Console > Build > App Check > Manage debug tokens.",
    );
  }

  await expect(page).toHaveURL("/dashboard");
  await page.context().storageState({ path: AUTH_FILE });
});
