"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useState, type FormEvent } from "react";
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
      setError("Could not create an account with that email and password.");
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
      setError("Could not sign up with Google.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-medium text-[#1f1610]">
        Create your account
      </h1>

      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-[#55483d]">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[#e4d9cf] bg-white px-3.5 py-2.5 text-[#1f1610] outline-none focus-visible:border-[#3d2b20]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[#55483d]">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[#e4d9cf] bg-white px-3.5 py-2.5 text-[#1f1610] outline-none focus-visible:border-[#3d2b20]"
          />
        </label>

        {error && <p className="text-sm text-[#a13c2c]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#3d2b20] px-4 py-2.5 font-semibold text-white transition-colors hover:bg-[#2b1e15] disabled:opacity-60"
        >
          Sign up
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.06em] text-[#8a705d]">
        <span className="h-px flex-1 bg-[#e4d9cf]" />
        or
        <span className="h-px flex-1 bg-[#e4d9cf]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={submitting}
        className="w-full rounded-lg border border-[#e4d9cf] bg-white px-4 py-2.5 font-semibold text-[#2a201a] transition-colors hover:bg-[#f2ece5] disabled:opacity-60"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-sm text-[#6b5a4e]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[#3d2b20]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
