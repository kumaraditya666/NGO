import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection } from "@/lib/store";
import { hashPassword, type StaffUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// Administrator directly sets a staff member's password (used when email
// delivery is unavailable, or for onboarding). Audited.
export async function POST(req: Request) {
  const g = requireApiRole(req, []);
  if ("error" in g) return g.error;
  if (g.session.role !== "administrator") return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password || String(password).length < 8)
    return NextResponse.json({ error: "Email and a password of 8+ characters are required" }, { status: 400 });
  const staff = await readCollection<StaffUser[]>("staff", []);
  const u = staff.find((s) => s.email === String(email).toLowerCase());
  if (!u) return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  const { salt, hash } = hashPassword(String(password));
  u.salt = salt;
  u.hash = hash;
  u.resetHash = undefined;
  u.resetExp = undefined;
  await writeCollection("staff", staff);
  await logAudit({ by: g.session.email, action: "staff:password-set", entity: "staff", entityId: u.email, detail: "set by administrator" });
  return NextResponse.json({ ok: true });
}
