"use client";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { AuthPrivacyNote } from "@/components/auth-privacy-note";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { establishServerSession } from "@/lib/firebase/session-client";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailSignIn(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      await establishServerSession(credential.user);
      window.location.assign(next);
    } catch {
      setError(
        "We couldn't sign you in with that email and password. Check both and try again, or continue with Google.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      const credential = await signInWithPopup(
        getFirebaseAuth(),
        new GoogleAuthProvider(),
      );
      await establishServerSession(credential.user);
      window.location.assign(next);
    } catch {
      setError(
        "Google sign-in didn't finish. Try again, or sign in with your email and password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="ac-h2">Sign in</h1>
      <p className="ac-muted mt-0 mb-7 text-[1rem] leading-relaxed">
        Pick up where you left off. Your answers and pinned programs are saved
        to your account.
      </p>

      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-5">
        <div>
          <label htmlFor="sign-in-email" className="ac-label">
            Email
          </label>
          <input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ac-input"
          />
        </div>
        <div>
          <label htmlFor="sign-in-password" className="ac-label">
            Password
          </label>
          <input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ac-input"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="m-0 rounded-[10px] border border-[#e0b4a4] bg-[#fbf1ec] px-3.5 py-3 text-[0.95rem] leading-snug text-[#8f2f1f]"
          >
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="ac-btn w-full">
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[0.9rem] text-[#6b5a4e]">
        <span aria-hidden="true" className="h-px flex-1 bg-[#e4d9cf]" />
        or
        <span aria-hidden="true" className="h-px flex-1 bg-[#e4d9cf]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting}
        className="ac-btn-ghost w-full"
      >
        Continue with Google
      </button>

      <p className="ac-muted mb-0 mt-6 text-[0.95rem]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="ac-link">
          Create one
        </Link>
      </p>

      <AuthPrivacyNote />
    </div>
  );
}
