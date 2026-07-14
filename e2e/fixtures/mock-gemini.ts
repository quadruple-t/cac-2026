import type { Page } from "@playwright/test";

// Firebase AI Logic's GoogleAIBackend calls firebasevertexai.googleapis.com under
// the hood (confirmed in node_modules/@firebase/ai's DEFAULT_DOMAIN constant).
// Mocking here keeps fema/conversational tests deterministic and quota-free.
const GEMINI_URL_PATTERN = "**/firebasevertexai.googleapis.com/**";

function generateContentBody(text: string) {
  return {
    candidates: [
      {
        content: { role: "model", parts: [{ text }] },
        finishReason: "STOP",
        index: 0,
      },
    ],
  };
}

/** Mocks a successful Gemini generateContent call returning the given plain-text payload. */
export async function mockGeminiSuccess(page: Page, text: string) {
  await page.route(GEMINI_URL_PATTERN, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(generateContentBody(text)),
    }),
  );
}

/** Mocks a Gemini call that fails outright (network/server error). */
export async function mockGeminiError(page: Page) {
  await page.route(GEMINI_URL_PATTERN, (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "internal error" } }),
    }),
  );
}
