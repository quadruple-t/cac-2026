import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "./admin";

export const SESSION_COOKIE_NAME = "__session";
const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSessionCookie(idToken: string): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });
}

export async function verifySessionCookie(cookie: string) {
  try {
    return await getAdminAuth().verifySessionCookie(cookie, true);
  } catch {
    return null;
  }
}

export type CurrentUser = {
  uid: string;
  email: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return null;
  }

  const decoded = await verifySessionCookie(sessionCookie);
  if (!decoded) {
    return null;
  }

  return { uid: decoded.uid, email: decoded.email ?? null };
}
