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
      className="w-fit rounded-lg border border-[#e4d9cf] bg-white px-4 py-2.5 font-semibold text-[#2a201a] transition-colors hover:bg-[#f2ece5] disabled:opacity-60"
    >
      Sign out
    </button>
  );
}
