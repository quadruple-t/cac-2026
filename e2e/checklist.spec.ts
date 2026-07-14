import { test, expect, type Page } from "@playwright/test";

async function fillIntakeForm(page: Page) {
  await page.locator("#county").fill("Buncombe");
  await page.locator("#damageType").selectOption("home");
  await page.locator("#ownershipStatus").selectOption("owner");
  await page.locator("#incomeRange").selectOption("low");
  await page.locator('input[name="isFarmer"][value="false"]').check();
  await page.locator("#damageSeverity").selectOption("severe");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/checklist");
  await page.evaluate(() => localStorage.removeItem("userSituation"));
  await page.reload();
});

test.describe("Checklist page", () => {
  test("submit is disabled until all required fields are filled", async ({ page }) => {
    const submit = page.getByRole("button", { name: "Generate My Document Checklist" });
    await expect(submit).toBeDisabled();

    await fillIntakeForm(page);

    await expect(submit).toBeEnabled();
  });

  test("submitting renders a document checklist grouped by category", async ({ page }) => {
    await fillIntakeForm(page);
    await page.getByRole("button", { name: "Generate My Document Checklist" }).click();

    await expect(page.getByTestId("document-checklist-item").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Identification" })).toBeVisible();
  });

  test("toggling a document's status updates the progress percentage", async ({ page }) => {
    await fillIntakeForm(page);
    await page.getByRole("button", { name: "Generate My Document Checklist" }).click();

    const firstCompleteButton = page
      .getByTestId("document-checklist-item")
      .first()
      .locator('[data-testid="document-status-button"][data-status="completed"]');
    await firstCompleteButton.click();

    await expect(page.getByText(/1 of \d+ completed/)).toBeVisible();
  });

  test("marking every document completed shows the completion banner", async ({ page }) => {
    await fillIntakeForm(page);
    await page.getByRole("button", { name: "Generate My Document Checklist" }).click();

    const completeButtons = page.locator(
      '[data-testid="document-status-button"][data-status="completed"]',
    );
    const count = await completeButtons.count();
    for (let i = 0; i < count; i++) {
      await completeButtons.nth(i).click();
    }

    await expect(page.getByRole("heading", { name: "You're All Set!" })).toBeVisible();
  });

  test("Start Over clears the checklist and returns to the intake form", async ({ page }) => {
    await fillIntakeForm(page);
    await page.getByRole("button", { name: "Generate My Document Checklist" }).click();
    await expect(page.getByTestId("document-checklist-item").first()).toBeVisible();

    await page.getByRole("button", { name: "Start Over" }).click();

    await expect(page.getByRole("button", { name: "Generate My Document Checklist" })).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem("userSituation"));
    expect(stored).toBeNull();
  });
});
