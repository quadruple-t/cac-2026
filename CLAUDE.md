# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Aid Compass is a Next.js 16 (App Router, Turbopack) app that helps disaster survivors (built around Hurricane Helene recovery in western North Carolina) find aid programs, generate document checklists, track deadlines, and decode FEMA letters. Firebase (Auth, Admin SDK, App Check, AI Logic/Gemini) is the only backend.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build (runs Next's own TypeScript pass as part of the build)
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`: `eslint-config-next` core-web-vitals + typescript)
- `npx tsc --noEmit` — type-check only, without building

There is no test suite in this repo. Copy `.env.local.example` to `.env.local` and fill in real Firebase project values before running `dev`/`build`; several modules (`lib/firebase/admin.ts`, `lib/crypto/field-encryption.ts`) throw on first use if their required env vars are missing.

## Architecture

### Auth flow
Firebase Auth runs entirely client-side (`lib/firebase/client.ts`, `lib/firebase/auth-context.tsx`). After a client sign-in/sign-up, `lib/firebase/session-client.ts` POSTs the ID token to `app/api/auth/session/route.ts`, which verifies it with the Admin SDK (`lib/firebase/admin.ts`) and sets an httpOnly session cookie (`lib/firebase/session.ts`). `proxy.ts` (see below) reads that cookie to gate server-rendered routes; individual pages additionally read `useAuth()` client-side and redirect unauthenticated users themselves, since **not every route under this pattern is actually listed in `proxy.ts`'s matcher** (e.g. `/conversational` and `/about` rely on the client-side check only) — check the matcher before assuming a route is proxy-protected.

### `proxy.ts`, not `middleware.ts`
This Next.js version renamed the middleware file convention to `proxy.ts` (see AGENTS.md above and `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Do not create a `middleware.ts` — the project root `proxy.ts` is the real request gate, defaulting to the Node.js runtime.

### Firebase App Check
`lib/firebase/client.ts` initializes App Check (reCAPTCHA v3, with a debug-token fallback for non-production via `NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN`) and is kicked off eagerly from `AuthProvider`'s effect. `getAppCheckHeader()` attaches the token as `X-Firebase-AppCheck` on calls to our own API routes; Firebase's own SDKs attach it automatically. `app/api/auth/session/route.ts` verifies it server-side via `verifyAppCheckToken()` in `lib/firebase/admin.ts` and rejects with 401 if missing/invalid — local dev will fail at the session step until the printed debug token is registered in the Firebase console (Build → App Check → Manage debug tokens).

### `jose` pinned via npm override
`package.json` pins `"jose": "^4.15.4"` via `overrides`. Without this, `firebase-admin` → `jwks-rsa@4.1.0` → `jose@6.x` breaks any code path that verifies a Firebase ID token or session cookie (`ERR_REQUIRE_ESM`, since `jose` v5+ dropped its CommonJS build and `jwks-rsa` still `require()`s it) — this only surfaces at runtime on Vercel/Turbopack, not in local `tsc`/`next build`. Don't remove this override without confirming a newer `jwks-rsa`/`firebase-admin` has actually fixed the upstream incompatibility.

### Two parallel, independently-defined domain models
`lib/aid-programs.ts` and `lib/document-requirements.ts` each declare their **own, separate** `AidProgram`, `UserSituation`, and (in effect) `getEligiblePrograms` — they are structurally similar but not the same type or the same data, and are not shared/re-exported between each other. Which one a page/component uses depends on which one it happened to import (e.g. `app/dashboard/page.tsx` imports `UserSituation`/`AidProgram`/`getEligiblePrograms` from `aid-programs.ts` but `generateDocumentChecklist` from `document-requirements.ts`; `app/checklist/page.tsx` uses `document-requirements.ts` exclusively). When changing eligibility rules or the shape of a user's "situation," check both files.

### Cross-page state: localStorage, not a database
A submitted `UserSituation` is persisted to `localStorage` under the key `userSituation` (not Firestore) so the Dashboard, Deadline Tracker, Checklist, and Conversational Intake pages can share one intake answer without re-asking the user. Firestore (`lib/firestore/applications.ts`) exists but is a separate, unused-by-the-UI persistence layer for `Application` records, with sensitive fields (`phone`, `address`, `householdIncome`) transparently AES-256-GCM encrypted/decrypted via `lib/crypto/field-encryption.ts` on write/read.

### Feature module pattern
Each major feature is a self-contained component under `components/features/<name>/index.tsx` (situation-intake, aid-dashboard, document-checklist, deadline-tracker, fema-explainer, conversational-intake), consumed by a matching route under `app/`. `components/features/index.ts` is a stale barrel export — it's missing `conversational-intake` and nothing in the app actually imports through it; components are imported from their concrete subpaths instead.

### Design system
Established in the landing page/nav and intended to be followed everywhere: Newsreader (serif, headings) + Public Sans (body) via `next/font/google` in `app/layout.tsx`; warm cream/terracotta palette (background `#f2ece5`, cards `#faf6f1`/border `#e4d9cf`, text `#1f1610`/`#6b5a4e`, brand accents `#3d2b20`/`#895031`/`#b0673f`); a single `1080px` content max-width across routes; the `.ac-reveal`/`.ac-reveal-2`/`.ac-reveal-3` staggered entrance animation and `.compass-needle` rotation helper defined in `app/globals.css` (both respect `prefers-reduced-motion`); flat bordered cards with no drop shadows; `components/compass-mark.tsx` (the logo) and `components/compass-status.tsx` (a needle-based status/urgency badge — the app's signature motif, used instead of plain colored pills) and `components/feature-icons.tsx` (small line-art SVGs used in place of emoji) are the shared building blocks — reuse them rather than re-implementing status badges or icons inline.
