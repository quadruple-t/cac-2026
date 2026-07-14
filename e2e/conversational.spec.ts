import { test, expect } from "@playwright/test";
import { mockGeminiSuccess, mockGeminiError } from "./fixtures/mock-gemini";

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

test.beforeEach(async ({ page }) => {
  await page.goto("/conversational");
  await page.evaluate(() => localStorage.removeItem("userSituation"));
  await page.reload();
});

test.describe("Conversational intake", () => {
  test("shows the initial assistant greeting", async ({ page }) => {
    await expect(page.getByTestId("chat-message-assistant").first()).toContainText(
      "Hi! I'm here to help you find disaster aid programs.",
    );
  });

  test("sending a message appends both the user message and a mocked assistant reply", async ({
    page,
  }) => {
    await mockGeminiSuccess(page, "Thanks! What county are you in?");

    await page.getByTestId("chat-input").fill("My home was damaged in the storm.");
    await page.getByTestId("chat-send-button").click();

    await expect(page.getByTestId("chat-message-user").last()).toContainText(
      "My home was damaged in the storm.",
    );
    await expect(page.getByTestId("chat-message-assistant").last()).toContainText(
      "Thanks! What county are you in?",
    );
  });

  test("a complete-situation reply surfaces results and transitions to the dashboard", async ({
    page,
  }) => {
    await mockGeminiSuccess(
      page,
      `I have all the information I need. Let me find the programs you qualify for.\n\`\`\`json\n${JSON.stringify(
        testSituation,
      )}\n\`\`\``,
    );

    await page.getByTestId("chat-input").fill("That's everything about my situation.");
    await page.getByTestId("chat-send-button").click();

    await expect(page.getByRole("button", { name: /Show Results \(\d\/8 fields\)/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Programs You Qualify For" })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("shows a fallback message when the AI call fails outright", async ({ page }) => {
    await mockGeminiError(page);

    await page.getByTestId("chat-input").fill("Hello?");
    await page.getByTestId("chat-send-button").click();

    // handleConversation() catches its own errors (network/model failures) and
    // returns this string rather than throwing, so this is what actually
    // renders — not the outer handleSubmit catch's message.
    await expect(page.getByTestId("chat-message-assistant").last()).toContainText(
      "I'm having trouble understanding. Could you rephrase that?",
    );
  });

  test("Start Over resets the chat to the initial greeting", async ({ page }) => {
    await mockGeminiSuccess(page, "Got it, thanks.");
    await page.getByTestId("chat-input").fill("Some info about my situation.");
    await page.getByTestId("chat-send-button").click();
    await expect(page.getByTestId("chat-message-user")).toHaveCount(1);

    await page.getByRole("button", { name: "Start Over" }).click();

    await expect(page.getByTestId("chat-message-user")).toHaveCount(0);
    await expect(page.getByTestId("chat-message-assistant")).toHaveCount(1);
  });
});
