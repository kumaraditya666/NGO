import crypto from "node:crypto";

export type Role = "administrator" | "editor" | "reviewer";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  salt: string;
  hash: string;
  createdAt: string;
}

export function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const h = crypto.scryptSync(password, s, 64).toString("hex");
  return { salt: s, hash: h };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const h = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(hash));
}

function secret(): string {
  return process.env.SESSION_SECRET || "dev-only-secret-min-32-chars-please-change";
}

export interface SessionPayload {
  email: string;
  role: Role;
  name: string;
  exp: number;
}

export function signSession(p: Omit<SessionPayload, "exp">): string {
  const payload: SessionPayload = { ...p, exp: Date.now() + 1000 * 60 * 60 * 12 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expect = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  if (sig.length !== expect.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "ngo_session";

export function canAccess(role: Role | undefined, allowed: Role[]): boolean {
  if (!role) return false;
  if (role === "administrator") return true;
  return allowed.includes(role);
}
