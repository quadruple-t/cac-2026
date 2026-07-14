import { test, expect } from "@playwright/test";

test.describe("Sign-in page", () => {
  test("shows an error and stays on the page for bad credentials", async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByLabel("Email").fill("no-such-user@example.com");
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByText("Could not sign in with that email and password."),
    ).toBeVisible();
    await expect(page).toHaveURL("/sign-in");
  });

  test("links to sign-up", async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByRole("link", { name: "Sign up" }).click();

    await expect(page).toHaveURL("/sign-up");
  });

  test("preserves the next param through to the sign-in URL", async ({ page }) => {
    await page.goto("/sign-in?next=%2Fdeadlines");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page).toHaveURL("/sign-in?next=%2Fdeadlines");
  });
});

test.describe("Sign-up page", () => {
  test("blocks submission of a password shorter than 6 characters", async ({ page }) => {
    await page.goto("/sign-up");

    await page.getByLabel("Email").fill(`e2e-shortpw-${Date.now()}@example.com`);
    const passwordInput = page.getByLabel("Password");
    await passwordInput.fill("abc");

    const isValid = await passwordInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid,
    );
    expect(isValid).toBe(false);
    await expect(page).toHaveURL("/sign-up");
  });

  test("links back to sign-in", async ({ page }) => {
    await page.goto("/sign-up");

    await page.getByRole("link", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/sign-in");
  });
});
