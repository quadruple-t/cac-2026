import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
  type AI,
  type GenerativeModel,
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

export function getGeminiModel(modelName = "gemini-3.1-flash-lite"): GenerativeModel {
  let model = modelCache.get(modelName);
  if (!model) {
    model = getGenerativeModel(getFirebaseAI(), { model: modelName });
    modelCache.set(modelName, model);
  }
  return model;
}

// Schema for the 8 core UserSituation fields the conversational intake needs
// to determine eligibility (see lib/aid-programs.ts). Constraining generation
// to this shape replaces fragile prose/regex JSON extraction.
export const SITUATION_SCHEMA = Schema.object({
  properties: {
    county: Schema.string({
      description: "The county the user lives in or was affected in, e.g. 'Buncombe County'.",
    }),
    damageType: Schema.enumString({
      enum: ["home", "business", "both", "other"],
      description: "Type of property damaged.",
    }),
    ownershipStatus: Schema.enumString({
      enum: ["owner", "renter", "both"],
      description: "Whether the user owns, rents, or both.",
    }),
    damageSeverity: Schema.enumString({
      enum: ["minor", "moderate", "severe", "destroyed"],
      description: "Severity of the damage.",
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
  ],
});

let cachedExtractionModel: GenerativeModel | null = null;

// Stateless, schema-constrained model used to extract structured UserSituation
// fields from a conversation transcript. Kept separate from getGeminiModel()
// because responseSchema/responseMimeType are fixed per model instance and
// would prevent that model from also producing free-form conversational replies.
export function getSituationExtractionModel(): GenerativeModel {
  if (!cachedExtractionModel) {
    cachedExtractionModel = getGenerativeModel(getFirebaseAI(), {
      model: "gemini-3.1-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: SITUATION_SCHEMA,
      },
    });
  }
  return cachedExtractionModel;
}

let cachedCorrectionModel: GenerativeModel | null = null;

// Stateless, JSON-mode model that turns a free-text correction (e.g. "I don't
// have insurance anymore") into a partial UserSituation patch. Not schema-
// constrained like getSituationExtractionModel() above, because it needs to
// be able to touch any of the ~150 UserSituation fields rather than just the
// 8 core eligibility ones — callers are responsible for whitelisting/
// validating the parsed keys (see lib/situation-memory.ts).
export function getCorrectionExtractionModel(): GenerativeModel {
  if (!cachedCorrectionModel) {
    cachedCorrectionModel = getGenerativeModel(getFirebaseAI(), {
      model: "gemini-3.1-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });
  }
  return cachedCorrectionModel;
}
