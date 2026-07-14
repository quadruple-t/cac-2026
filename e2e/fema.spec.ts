import { test, expect } from "@playwright/test";
import { mockGeminiSuccess, mockGeminiError } from "./fixtures/mock-gemini";

const SAMPLE_LETTER = "Dear Applicant, your FEMA application has been reviewed...";

test.describe("FEMA letter explainer", () => {
  test("Analyze button is disabled until letter text is entered", async ({ page }) => {
    await page.goto("/fema");

    const analyzeButton = page.getByRole("button", { name: "Analyze My Letter →" });
    await expect(analyzeButton).toBeDisabled();

    await page.locator("#letter").fill(SAMPLE_LETTER);
    await expect(analyzeButton).toBeEnabled();
  });

  test("happy path: analyze, view results, and complete the walkthrough", async ({ page }) => {
    await mockGeminiSuccess(
      page,
      JSON.stringify({
        status: "Approved",
        meaning: "Your application has been approved for assistance.",
        nextSteps: ["Review your award letter", "Set up direct deposit"],
        amount: "$12,000",
        deadline: "Respond within 60 days",
        appealInfo: null,
      }),
    );

    await page.goto("/fema");
    await page.locator("#letter").fill(SAMPLE_LETTER);
    await page.getByRole("button", { name: "Analyze My Letter →" }).click();

    await expect(page.getByTestId("fema-result-status")).toHaveText("Approved");
    await expect(page.getByTestId("fema-result-amount")).toHaveText("$12,000");
    await expect(page.getByTestId("fema-result-deadline")).toHaveText("Respond within 60 days");

    await page.getByRole("button", { name: "Start Step-by-Step Guide →" }).click();
    await expect(page.getByTestId("fema-walkthrough-step")).toContainText("Review your award letter");

    await page.getByRole("button", { name: "Next →" }).click();
    await expect(page.getByTestId("fema-walkthrough-step")).toContainText("Set up direct deposit");

    await page.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByRole("heading", { name: "You're All Set!" })).toBeVisible();
  });

  test("shows appeal information when returned by the analysis", async ({ page }) => {
    await mockGeminiSuccess(
      page,
      JSON.stringify({
        status: "Denied",
        meaning: "Your application was denied.",
        nextSteps: ["File an appeal within 60 days"],
        amount: null,
        deadline: "60 days to appeal",
        appealInfo: "Call the FEMA helpline at 1-800-621-3362 to begin your appeal.",
      }),
    );

    await page.goto("/fema");
    await page.locator("#letter").fill(SAMPLE_LETTER);
    await page.getByRole("button", { name: "Analyze My Letter →" }).click();

    await expect(page.getByTestId("fema-result-appeal")).toContainText("1-800-621-3362");
  });

  test("shows an error banner and reverts to the upload step on a malformed AI response", async ({
    page,
  }) => {
    await mockGeminiSuccess(page, "this is not valid JSON");

    await page.goto("/fema");
    await page.locator("#letter").fill(SAMPLE_LETTER);
    await page.getByRole("button", { name: "Analyze My Letter →" }).click();

    await expect(page.getByText(/^Failed to analyze the letter:/)).toBeVisible();
    await expect(page.locator("#letter")).toBeVisible();
  });

  test("shows an error banner when the AI call fails outright", async ({ page }) => {
    await mockGeminiError(page);

    await page.goto("/fema");
    await page.locator("#letter").fill(SAMPLE_LETTER);
    await page.getByRole("button", { name: "Analyze My Letter →" }).click();

    await expect(page.getByText(/^Failed to analyze the letter:/)).toBeVisible();
  });
});
