import { test, expect } from "@playwright/test";

test.describe("Unauthenticated access to protected routes", () => {
  for (const path of ["/dashboard", "/checklist", "/deadlines", "/fema"]) {
    test(`${path} redirects to /sign-in?next=${encodeURIComponent(path)}`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(`/sign-in?next=${encodeURIComponent(path)}`);
    });
  }

  test("/conversational is not proxy-gated but the client-side guard still redirects to /sign-in", async ({
    page,
  }) => {
    // Not in proxy.ts's matcher, so the page itself loads first...
    await page.goto("/conversational");

    // ...before its own useAuth() guard kicks in and redirects (no `next` param,
    // unlike the server-side proxy redirect for the other protected routes).
    await expect(page).toHaveURL("/sign-in");
  });
});
