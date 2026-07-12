"use client";

import type { User } from "firebase/auth";
import { getAppCheckHeader } from "./client";

export async function establishServerSession(user: User): Promise<void> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAppCheckHeader()),
    },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    throw new Error("Failed to establish server session");
  }
}

export async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", {
    method: "DELETE",
    headers: await getAppCheckHeader(),
  });
}
