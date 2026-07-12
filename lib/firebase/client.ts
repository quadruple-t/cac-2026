import {
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeAppCheck,
  getToken,
  ReCaptchaV3Provider,
  type AppCheck,
} from "firebase/app-check";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy singletons: deferred until first call inside a browser effect/handler
// (never at module import time), so pages can still be built/prerendered on
// the server before real Firebase config is available in the environment.
export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
}

let cachedAppCheck: AppCheck | null = null;

export function getAppCheck(): AppCheck {
  if (!cachedAppCheck) {
    // Lets a local/preview build register a stable debug token in the
    // Firebase console's App Check debug token list instead of failing
    // reCAPTCHA verification (which requires a domain reCAPTCHA is aware of).
    if (process.env.NODE_ENV !== "production") {
      (self as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
        process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN ?? true;
    }

    cachedAppCheck = initializeAppCheck(getFirebaseApp(), {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
      isTokenAutoRefreshEnabled: true,
    });
  }
  return cachedAppCheck;
}

// For attaching to fetch() calls against our own API routes — Firebase's own
// SDKs (Auth, Firestore, AI Logic, etc.) already attach the App Check token
// automatically once initializeAppCheck() has run on the app instance.
export async function getAppCheckHeader(): Promise<Record<string, string>> {
  const { token } = await getToken(getAppCheck());
  return { "X-Firebase-AppCheck": token };
}

let cachedAuth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getFirebaseApp());
  }
  return cachedAuth;
}
