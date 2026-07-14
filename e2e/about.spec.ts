import { test, expect } from "@playwright/test";

test.describe("About page", () => {
  test("shows the mission heading and GitHub link", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { name: "Aid Compass", exact: true })).toBeVisible();

    const githubLink = page.getByRole("link", { name: "View on GitHub" });
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/quadruple-t/cac-2026",
    );
    await expect(githubLink).toHaveAttribute("target", "_blank");
  });

  test("lists all four contributors", async ({ page }) => {
    await page.goto("/about");

    for (const name of ["Taran Duba", "Mukesh Ramanathan", "Ansh Nayak", "Hannah Kim"]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
  });
});
