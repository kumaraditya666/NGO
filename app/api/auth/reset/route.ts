import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { readCollection, writeCollection } from "@/lib/store";
import { hashPassword, type StaffUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit("pw-reset:" + (req.headers.get("x-forwarded-for") || "a"), 10))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { token, password } = await req.json().catch(() => ({}));
  if (!token || typeof token !== "string")
    return NextResponse.json({ error: "Reset link is missing or invalid." }, { status: 400 });
  if (!password || typeof password !== "string" || password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  const staff = await readCollection<StaffUser[]>("staff", []);
  const digest = crypto.createHash("sha256").update(token).digest("hex");
  const u = staff.find((s) => s.resetHash === digest && (s.resetExp || 0) > Date.now());
  if (!u) return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  const { salt, hash } = hashPassword(password);
  u.salt = salt;
  u.hash = hash;
  u.resetHash = undefined;
  u.resetExp = undefined;
  await writeCollection("staff", staff);
  await logAudit({ by: u.email, action: "staff:password-reset", entity: "staff", entityId: u.email, detail: "self-service token used" });
  return NextResponse.json({ ok: true });
}
