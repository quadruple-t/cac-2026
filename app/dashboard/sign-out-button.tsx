"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { clearServerSession } from "@/lib/firebase/session-client";

export function SignOutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSignOut() {
    setSubmitting(true);
    await Promise.all([getFirebaseAuth().signOut(), clearServerSession()]);
    router.push("/sign-in");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={submitting}
      className="ac-btn-ghost w-fit"
    >
      {submitting ? "Signing out…" : "Sign out"}
    </button>
  );
}
