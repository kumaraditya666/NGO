import { NextResponse } from "next/server";
import { verifySession, type Role } from "@/lib/auth";

export function requireApiRole(req: Request, allowed: Role[]) {
  const token = req.headers.get("cookie")?.match(/ngo_session=([^;]+)/)?.[1];
  const s = verifySession(token ? decodeURIComponent(token) : null);
  if (!s) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (s.role !== "administrator" && !allowed.includes(s.role))
    return { error: NextResponse.json({ error: "Forbidden for role " + s.role }, { status: 403 }) };
  return { session: s };
}
