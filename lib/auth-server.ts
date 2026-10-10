import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./auth";

export function getSession(): SessionPayload | null {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    return verifySession(token);
  } catch {
    return null;
  }
}
