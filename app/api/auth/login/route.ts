import { NextResponse } from "next/server";
import { readCollection, writeCollection } from "@/lib/store";
import { hashPassword, verifyPassword, signSession, SESSION_COOKIE, type StaffUser } from "@/lib/auth";

async function ensureBootstrap(): Promise<StaffUser[]> {
  let staff = await readCollection<StaffUser[]>("staff", []);
  if (staff.length === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const { salt, hash } = hashPassword(process.env.ADMIN_PASSWORD);
    staff = [{ id: "staff_admin", email: process.env.ADMIN_EMAIL.toLowerCase(), name: "Administrator", role: "administrator", salt, hash, createdAt: new Date().toISOString() }];
    await writeCollection("staff", staff);
  }
  return staff;
}

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  const staff = await ensureBootstrap();
  if (staff.length === 0)
    return NextResponse.json(
      { error: "No staff accounts exist and no ADMIN_EMAIL/ADMIN_PASSWORD is set. Set them in .env.local and restart the server." },
      { status: 503 }
    );
  const u = staff.find((s) => s.email === String(email).trim().toLowerCase());
  if (!u || !verifyPassword(String(password), u.salt, u.hash)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const token = signSession({ email: u.email, role: u.role, name: u.name });
  const res = NextResponse.json({ email: u.email, role: u.role, name: u.name });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}
