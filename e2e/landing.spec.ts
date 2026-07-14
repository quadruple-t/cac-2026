import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows hero content and the sign-up CTA", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Find the disaster aid you actually qualify for." }),
    ).toBeVisible();

    const cta = page.getByRole("link", { name: "Get started — it's free" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/sign-up");
  });

  test("footer 'Open Aid Compass' link leads to sign-in when unauthenticated", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Open Aid Compass" }).click();

    await expect(page).toHaveURL("/sign-in?next=%2Fdashboard");
  });

  test("renders without error under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
