import "server-only";
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

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
