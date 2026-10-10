import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { hashPassword, type StaffUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const g = requireApiRole(req, []);
  if ("error" in g) return g.error;
  if (g.session.role !== "administrator") return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const staff = await readCollection<StaffUser[]>("staff", []);
  return NextResponse.json({ staff: staff.map((s) => ({ id: s.id, email: s.email, name: s.name, role: s.role, createdAt: s.createdAt })) });
}

export async function POST(req: Request) {
  const g = requireApiRole(req, []);
  if ("error" in g) return g.error;
  if (g.session.role !== "administrator") return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const { email, name, role, password } = await req.json().catch(() => ({}));
  if (!email || !password || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const staff = await readCollection<StaffUser[]>("staff", []);
  const { salt, hash } = hashPassword(String(password));
  staff.push({ id: uid("staff"), email: String(email).toLowerCase(), name: name || email, role, salt, hash, createdAt: new Date().toISOString() });
  await writeCollection("staff", staff);
  await logAudit({ by: g.session.email, action: "staff:create", entity: "staff", entityId: email, detail: `role=${role}` });
  return NextResponse.json({ ok: true });
}
