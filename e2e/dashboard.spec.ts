import { test, expect, type Page } from "@playwright/test";

const testSituation = {
  county: "Buncombe",
  damageType: "home",
  ownershipStatus: "owner",
  hasInsurance: false,
  incomeRange: "low",
  isFarmer: false,
  hasAppliedToFEMA: false,
  damageSeverity: "severe",
};

async function fillIntakeForm(page: Page) {
  await page.locator("#county").fill(testSituation.county);
  await page.locator("#damageType").selectOption(testSituation.damageType);
  await page.locator("#ownershipStatus").selectOption(testSituation.ownershipStatus);
  await page.locator("#damageSeverity").selectOption(testSituation.damageSeverity);
  await page.locator('input[name="isFarmer"][value="false"]').check();
  await page.locator("#incomeRange").selectOption(testSituation.incomeRange);
  await page.getByRole("button", { name: "Find My Eligible Programs" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard");
  await page.evaluate(() => localStorage.removeItem("userSituation"));
  await page.reload();
});

test.describe("Dashboard intake and results", () => {
  test("submitting the intake form shows eligible programs and persists to localStorage", async ({
    page,
  }) => {
    await fillIntakeForm(page);

    await expect(page.getByRole("button", { name: /Aid Programs \(\d+\)/ })).toBeVisible();
    const programCards = page.getByTestId("program-card");
    await expect(programCards).toHaveCount(6);

    const stored = await page.evaluate(() => localStorage.getItem("userSituation"));
    expect(JSON.parse(stored!)).toMatchObject(testSituation);
  });

  test("Documents tab shows the generated checklist", async ({ page }) => {
    await fillIntakeForm(page);

    await page.getByRole("button", { name: /Document Checklist \(\d+\)/ }).click();
    await expect(page.getByTestId("document-checklist-item").first()).toBeVisible();
  });

  test("Start Over clears the situation and returns to the intake form", async ({ page }) => {
    await fillIntakeForm(page);
    await expect(page.getByTestId("program-card").first()).toBeVisible();

    await page.getByRole("button", { name: "← Start Over" }).click();

    await expect(page.getByRole("button", { name: "Find My Eligible Programs" })).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem("userSituation"));
    expect(stored).toBeNull();
  });

  test("a pre-seeded valid situation skips the intake form on load", async ({ page }) => {
    await page.evaluate(
      (situation) => localStorage.setItem("userSituation", JSON.stringify(situation)),
      testSituation,
    );
    await page.reload();

    await expect(page.getByTestId("program-card").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Find My Eligible Programs" })).toHaveCount(0);
  });

  test("a malformed pre-seeded situation falls back to the intake form", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("userSituation", "{not valid json"));
    await page.reload();

    await expect(page.getByRole("button", { name: "Find My Eligible Programs" })).toBeVisible();
  });
});
