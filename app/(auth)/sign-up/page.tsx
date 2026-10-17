"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthPrivacyNote } from "@/components/auth-privacy-note";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { establishServerSession } from "@/lib/firebase/session-client";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailSignUp(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password,
      );
      await establishServerSession(credential.user);
      window.location.assign("/dashboard");
    } catch {
      setError(
        "We couldn't create your account. If that email already has an account, sign in instead. Otherwise, check the email and use a password of at least 6 characters.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setSubmitting(true);
    try {
      const credential = await signInWithPopup(
        getFirebaseAuth(),
        new GoogleAuthProvider(),
      );
      await establishServerSession(credential.user);
      window.location.assign("/dashboard");
    } catch {
      setError(
        "Google sign-up didn't finish. Try again, or sign up with your email and a password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="ac-h2">Create your account</h1>
      <p className="ac-muted mt-0 mb-7 text-[1rem] leading-relaxed">
        Save your answers and pinned programs so you can come back to them on
        any device.
      </p>

      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-5">
        <div>
          <label htmlFor="sign-up-email" className="ac-label">
            Email
          </label>
          <input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ac-input"
          />
        </div>
        <div>
          <label htmlFor="sign-up-password" className="ac-label">
            Password
          </label>
          <input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            aria-describedby="sign-up-password-hint"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="ac-input"
          />
          <p id="sign-up-password-hint" className="ac-note mb-0 mt-1.5">
            At least 6 characters.
          </p>
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[0.9rem] text-[#6b5a4e]">
        <span aria-hidden="true" className="h-px flex-1 bg-[#e4d9cf]" />
        or
        <span aria-hidden="true" className="h-px flex-1 bg-[#e4d9cf]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={submitting}
        className="ac-btn-ghost w-full"
      >
        Continue with Google
      </button>

      <p className="ac-muted mb-0 mt-6 text-[0.95rem]">
        Already have an account?{" "}
        <Link href="/sign-in" className="ac-link">
          Sign in
        </Link>
      </p>

      <AuthPrivacyNote />
    </div>
  );
}
