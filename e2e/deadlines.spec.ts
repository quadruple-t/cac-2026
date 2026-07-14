import { test, expect } from "@playwright/test";

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

test.describe("Deadline tracker", () => {
  test("shows a deadline card per eligible program with correct contact links", async ({
    page,
  }) => {
    await page.goto("/deadlines");
    await page.evaluate(
      (situation) => localStorage.setItem("userSituation", JSON.stringify(situation)),
      testSituation,
    );
    await page.reload();

    const cards = page.getByTestId("deadline-card");
    await expect(cards).toHaveCount(6);

    const femaCard = page.locator('[data-testid="deadline-card"][data-program-id="fema-ia"]');
    await expect(femaCard.locator('a[href="tel:1-800-621-3362"]')).toBeVisible();
  });

  test("changing a program's status dropdown updates its value", async ({ page }) => {
    await page.goto("/deadlines");
    await page.evaluate(
      (situation) => localStorage.setItem("userSituation", JSON.stringify(situation)),
      testSituation,
    );
    await page.reload();

    const select = page.getByTestId("deadline-status-select").first();
    await select.selectOption("applied");

    await expect(select).toHaveValue("applied");
  });

  test("subscribing to email reminders shows a confirmation", async ({ page }) => {
    await page.goto("/deadlines");
    await page.evaluate(
      (situation) => localStorage.setItem("userSituation", JSON.stringify(situation)),
      testSituation,
    );
    await page.reload();

    await page.getByPlaceholder("Enter your email").fill("survivor@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Subscribed! We'll send reminders to survivor@example.com")).toBeVisible();
  });

  test("renders with no cards when no situation is saved, without crashing", async ({ page }) => {
    await page.goto("/deadlines");
    await page.evaluate(() => localStorage.removeItem("userSituation"));
    await page.reload();

    await expect(page.getByTestId("deadline-card")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Track Your Application Deadlines" })).toBeVisible();
  });
});
