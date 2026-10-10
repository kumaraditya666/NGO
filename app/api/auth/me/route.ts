import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: Request) {
  const token = req.headers.get("cookie")?.match(/ngo_session=([^;]+)/)?.[1];
  const s = verifySession(token ? decodeURIComponent(token) : null);
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({ user: s });
}
