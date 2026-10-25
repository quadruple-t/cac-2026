import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
  type AI,
  type Content,
  type GenerateContentResult,
  type GenerativeModel,
  type Part,
} from "firebase/ai";
import { getFirebaseApp } from "./client";

// Lazy singletons, same rationale as getFirebaseAuth() in ./client: deferred
// until first call inside a browser effect/handler, never at module import
// time, so builds/prerenders aren't affected by missing env vars.
let cachedAI: AI | null = null;

export function getFirebaseAI(): AI {
  if (!cachedAI) {
    cachedAI = getAI(getFirebaseApp(), { backend: new GoogleAIBackend() });
  }
  return cachedAI;
}

const modelCache = new Map<string, GenerativeModel>();

// Primary model, and a fallback to use when the primary is overloaded.
//
// NOTE: "gemini-2.5-flash" is an UNVERIFIED GUESS for the fallback — we don't
// know exactly what's enabled in this Firebase project's AI Logic console
// (GoogleAIBackend / Gemini Developer API, not Vertex). If this 404s or comes
// back as "model not found"/"not enabled", check Build -> AI Logic / Gemini
// API in the Firebase console and swap FALLBACK_MODEL for whatever is
// actually available there.
const PRIMARY_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_MODEL = "gemini-2.5-flash";
const MODEL_CHAIN = [PRIMARY_MODEL, FALLBACK_MODEL];

export function getGeminiModel(modelName = PRIMARY_MODEL): GenerativeModel {
  let model = modelCache.get(modelName);
  if (!model) {
    model = getGenerativeModel(getFirebaseAI(), { model: modelName });
    modelCache.set(modelName, model);
  }
  return model;
}

// Schema for the core UserSituation fields the conversational intake needs
// to determine eligibility (see lib/aid-programs.ts). Constraining generation
// to this shape replaces fragile prose/regex JSON extraction.
//
// primaryNeed/supplementaryNeeds use the same NeedCategory values defined in
// components/features/aid-intake/index.tsx (not currently exported from
// lib/aid-programs.ts — verified by reading that file directly).
const NEED_CATEGORY_ENUM = [
  "home",
  "rental",
  "personal_property",
  "vehicle",
  "utilities",
  "childcare",
  "medical",
  "employment",
  "business",
  "agricultural",
  "nonprofit",
] as const;

export const SITUATION_SCHEMA = Schema.object({
  properties: {
    county: Schema.string({
      description: "The county the user lives in or was affected in, e.g. 'Buncombe County'.",
    }),
    damageType: Schema.enumString({
      enum: ["home", "business", "both", "other"],
      description:
        "Type of property damaged. Use 'home' for any residence (house, apartment, mobile home, etc.), including colloquial phrasing like 'my house burned down' or 'our place flooded' — infer the category, don't require the literal word 'home'.",
    }),
    ownershipStatus: Schema.enumString({
      enum: ["owner", "renter", "both"],
      description: "Whether the user owns, rents, or both.",
    }),
    damageSeverity: Schema.enumString({
      enum: ["minor", "moderate", "severe", "destroyed"],
      description:
        "Severity of the damage. Use 'destroyed' for total-loss language such as 'burned down', 'totaled', 'collapsed', 'nothing left', or 'completely gone'; 'severe' for major but not total damage; 'moderate' for significant repairable damage; 'minor' for small or cosmetic damage.",
    }),
    hasInsurance: Schema.boolean({
      description: "Whether the user has any relevant insurance coverage.",
    }),
    isFarmer: Schema.boolean({
      description: "Whether the user is a farmer or owns agricultural land.",
    }),
    incomeRange: Schema.enumString({
      enum: ["low", "medium", "high", "prefer_not_to_say"],
      description: "Household income range.",
    }),
    hasAppliedToFEMA: Schema.boolean({
      description: "Whether the user has already applied for FEMA individual assistance.",
    }),
    vehicleDamaged: Schema.boolean({
      description: "Whether the user's vehicle was damaged or lost.",
    }),
    primaryNeed: Schema.enumString({
      enum: [...NEED_CATEGORY_ENUM],
      description: "The single category of need that matters most to the user right now.",
    }),
    supplementaryNeeds: Schema.array({
      items: Schema.enumString({
        enum: [...NEED_CATEGORY_ENUM],
        description: "An additional category of need the user mentioned, besides their primary need.",
      }),
      description: "Additional categories of need the user mentioned, besides their primary need.",
    }),
  },
  optionalProperties: [
    "county",
    "damageType",
    "ownershipStatus",
    "damageSeverity",
    "hasInsurance",
    "isFarmer",
    "incomeRange",
    "hasAppliedToFEMA",
    "vehicleDamaged",
    "primaryNeed",
    "supplementaryNeeds",
  ],
});

export const AI_BUSY_MESSAGE =
  "Our AI is experiencing high traffic right now. Please try again in a little while.";

// True when a Firebase AI call failed because the model is overloaded or
// rate-limited (HTTP 429/500/503), as opposed to a bug in our own request.
export function isAIBusyError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /\[(429|500|503)[\s\]]|high demand|overloaded|unavailable|quota|rate limit/i.test(message);
}

// Friendly message for a failed AI call: the busy notice when the model is
// overloaded, otherwise the caller's own fallback.
export function aiErrorMessage(error: unknown, fallback: string): string {
  return isAIBusyError(error) ? AI_BUSY_MESSAGE : fallback;
}

const RETRY_DELAYS_MS = [1000, 2000, 4000];

// Retries `fn` when it rejects with an isAIBusyError error, waiting
// (by default) 1s, then 2s, then 4s between attempts — up to 3 retries (4
// attempts total). Any other error, or exhausting the delay list, rethrows
// immediately. Uses a real setTimeout-based delay, not a busy-wait.
export async function withRetry<T>(
  fn: () => Promise<T>,
  delaysMs: number[] = RETRY_DELAYS_MS,
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      if (!isAIBusyError(error) || attempt >= delaysMs.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]));
      attempt++;
    }
  }
}

// Runs `fn` against each model name in `modelNames` (default: the primary
// model, then the fallback), retrying each one via withRetry before moving
// on to the next. Only isAIBusyError failures fall through to the next
// model; any other error (or exhausting the whole chain) rethrows.
async function withModelFallback<T>(
  fn: (modelName: string) => Promise<T>,
  modelNames: string[] = MODEL_CHAIN,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < modelNames.length; i++) {
    try {
      return await withRetry(() => fn(modelNames[i]));
    } catch (error) {
      lastError = error;
      if (!isAIBusyError(error) || i === modelNames.length - 1) throw error;
    }
  }
  // Unreachable (the loop above always either returns or throws), but keeps
  // TypeScript happy about every path returning/throwing.
  throw lastError;
}

// One-shot (non-chat) generation with automatic retry + model fallback. Use
// this in place of `getGeminiModel().generateContent(prompt)` wherever the
// caller doesn't need a fixed JSON response shape (for JSON-mode one-shot
// calls, prefer getJsonModel()/getSituationExtractionModel()/
// getCorrectionExtractionModel() below, which bake retry+fallback in too).
export function generateWithFallback(
  prompt: string | Array<string | Part>,
  options?: { modelNames?: string[] },
): Promise<GenerateContentResult> {
  return withModelFallback(
    (modelName) => getGeminiModel(modelName).generateContent(prompt),
    options?.modelNames,
  );
}

// A drop-in replacement for a plain `GenerativeModel` for JSON-mode one-shot
// callers: same `.generateContent(prompt)` call shape, but transparently
// retries and falls back across MODEL_CHAIN under the hood. Each model name
// gets its own cached GenerativeModel instance sharing the same
// generationConfig (so schema-constrained callers keep the same schema on
// every model in the chain).
export interface FallbackJsonModel {
  generateContent(prompt: string | Array<string | Part>): Promise<GenerateContentResult>;
}

function createFallbackJsonModel(generationConfig: {
  responseMimeType: string;
  responseSchema?: Schema;
}): FallbackJsonModel {
  const instances = new Map<string, GenerativeModel>();
  const getInstance = (modelName: string): GenerativeModel => {
    let model = instances.get(modelName);
    if (!model) {
      model = getGenerativeModel(getFirebaseAI(), { model: modelName, generationConfig });
      instances.set(modelName, model);
    }
    return model;
  };
  return {
    generateContent: (prompt) =>
      withModelFallback((modelName) => getInstance(modelName).generateContent(prompt)),
  };
}

let cachedExtractionModel: FallbackJsonModel | null = null;

// Stateless, schema-constrained model used to extract structured UserSituation
// fields from a conversation transcript. Kept separate from getGeminiModel()
// because responseSchema/responseMimeType are fixed per model instance and
// would prevent that model from also producing free-form conversational replies.
//
// Call shape is unchanged from before (`getSituationExtractionModel().generateContent(prompt)`)
// — retry+fallback now happen transparently inside .generateContent().
export function getSituationExtractionModel(): FallbackJsonModel {
  if (!cachedExtractionModel) {
    cachedExtractionModel = createFallbackJsonModel({
      responseMimeType: "application/json",
      responseSchema: SITUATION_SCHEMA,
    });
  }
  return cachedExtractionModel;
}

let cachedCorrectionModel: FallbackJsonModel | null = null;

// Stateless, JSON-mode model that turns a free-text correction (e.g. "I don't
// have insurance anymore") into a partial UserSituation patch. Not schema-
// constrained like getSituationExtractionModel() above, because it needs to
// be able to touch any of the ~150 UserSituation fields rather than just the
// core eligibility ones — callers are responsible for whitelisting/
// validating the parsed keys (see lib/situation-memory.ts).
//
// Call shape is unchanged from before — retry+fallback happen transparently.
export function getCorrectionExtractionModel(): FallbackJsonModel {
  if (!cachedCorrectionModel) {
    cachedCorrectionModel = createFallbackJsonModel({ responseMimeType: "application/json" });
  }
  return cachedCorrectionModel;
}

let cachedJsonModel: FallbackJsonModel | null = null;

// Stateless, JSON-mode model with no fixed schema, for callers (e.g. the FEMA
// letter explainer) that want reliable JSON back but describe the shape
// themselves in the prompt rather than via a Schema. Same
// `.generateContent(prompt)` call shape and retry+fallback behavior as the
// other model getters above.
export function getJsonModel(): FallbackJsonModel {
  if (!cachedJsonModel) {
    cachedJsonModel = createFallbackJsonModel({ responseMimeType: "application/json" });
  }
  return cachedJsonModel;
}

// A chat-streaming chunk, or a reset marker. Callers should accumulate
// `text` fragments to build up the assistant's reply, but must clear
// whatever they've accumulated so far whenever they see `reset: true`: that
// marks a previous attempt failing mid-stream (isAIBusyError) and this call
// starting the reply over from scratch, either retrying the same model or
// falling back to the next one in the chain. A normal, uninterrupted stream
// never emits a reset chunk.
export interface ChatStreamChunk {
  text: string;
  reset?: boolean;
}

// Streaming chat send with automatic retry + model fallback. Replaces the
// pattern of keeping a long-lived `ChatSession` ref and calling
// `.startChat()`/`.sendMessageStream()` on a plain `getGeminiModel()` — that
// pattern can't recover mid-conversation if the pinned model is overloaded.
// This is stateless instead: pass the full prior history each time (see
// toChatHistory()-style helpers), and this creates a fresh ChatSession per
// call, trying each model in the chain.
//
// Usage:
//   for await (const { text, reset } of sendChatMessageWithFallback({ history, systemInstruction, message })) {
//     if (reset) replyText = ''; else replyText += text;
//     setMessages([...messagesWithUser, { role: 'assistant', content: replyText }]);
//   }
//
// Throws (after exhausting every model + retry) for anything that isn't an
// isAIBusyError, or once the whole chain is exhausted.
export async function* sendChatMessageWithFallback(params: {
  history: Content[];
  systemInstruction: string;
  message: string;
  modelNames?: string[];
}): AsyncGenerator<ChatStreamChunk, void, unknown> {
  const modelNames = params.modelNames ?? MODEL_CHAIN;
  const delays = RETRY_DELAYS_MS;
  let lastError: unknown;
  let yieldedAny = false;

  for (let m = 0; m < modelNames.length; m++) {
    const modelName = modelNames[m];
    const isLastModel = m === modelNames.length - 1;

    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        if (yieldedAny) {
          // A previous attempt streamed partial text before failing; tell
          // the caller to discard it since this attempt starts over.
          yield { text: "", reset: true };
          yieldedAny = false;
        }

        const chat = getGeminiModel(modelName).startChat({
          systemInstruction: params.systemInstruction,
          history: params.history,
        });
        const { stream } = await chat.sendMessageStream(params.message);
        for await (const chunk of stream) {
          yieldedAny = true;
          yield { text: chunk.text() };
        }
        return;
      } catch (error) {
        lastError = error;
        if (!isAIBusyError(error)) throw error;

        if (attempt < delays.length) {
          await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
          continue; // retry the same model
        }
        if (isLastModel) throw error; // nothing left to try
        break; // fall through to the next model in the outer loop
      }
    }
  }
  throw lastError;
}
