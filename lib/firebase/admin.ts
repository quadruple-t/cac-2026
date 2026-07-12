import "server-only";
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAppCheck, type AppCheck } from "firebase-admin/app-check";

function loadPrivateKey(): string {
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!raw) {
    throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is not set");
  }
  return raw.replace(/\\n/g, "\n");
}

function getAdminApp(): App {
  return getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: loadPrivateKey(),
        }),
      });
}

// Lazy singletons: initialization (and its env var validation) only runs on
// first actual use, not at module import time, so this module can be safely
// imported during build-time page-data collection before .env.local exists.
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedAppCheck: AppCheck | null = null;

export function getAdminAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getAdminApp());
  }
  return cachedAuth;
}

export function getAdminDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getAdminApp());
  }
  return cachedDb;
}

export function getAdminAppCheck(): AppCheck {
  if (!cachedAppCheck) {
    cachedAppCheck = getAppCheck(getAdminApp());
  }
  return cachedAppCheck;
}

const APP_CHECK_HEADER = "x-firebase-appcheck";

/** Verifies the App Check token on an incoming Request; throws if missing/invalid. */
export async function verifyAppCheckToken(request: Request): Promise<void> {
  const token = request.headers.get(APP_CHECK_HEADER);
  if (!token) {
    throw new Error("Missing App Check token");
  }
  await getAdminAppCheck().verifyToken(token);
}
