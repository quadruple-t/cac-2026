import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
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

export function getGeminiModel(modelName = "gemini-3.5-flash"): GenerativeModel {
  let model = modelCache.get(modelName);
  if (!model) {
    model = getGenerativeModel(getFirebaseAI(), { model: modelName });
    modelCache.set(modelName, model);
  }
  return model;
}
