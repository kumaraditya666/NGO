import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection } from "@/lib/store";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const g = requireApiRole(req, []);
  if ("error" in g) return g.error;
  if (g.session.role !== "administrator") {
    // editors/reviewers get redacted payment fields
    const s = await readCollection<any>("settings", {});
    const { accountNumber, ...rest } = s;
    return NextResponse.json({ settings: { ...rest, accountNumber: accountNumber ? "••••" + String(accountNumber).slice(-4) : "" }, redacted: true });
  }
  const s = await readCollection<any>("settings", {});
  return NextResponse.json({ settings: s });
}

export async function POST(req: Request) {
  const g = requireApiRole(req, []);
  if ("error" in g) return g.error;
  if (g.session.role !== "administrator") return NextResponse.json({ error: "Only administrators can change payment details" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const prev = await readCollection<any>("settings", {});
  await writeCollection("settings", { ...prev, ...body });
  await logAudit({ by: g.session.email, action: "settings:update", entity: "settings", entityId: "site", detail: `changed=${Object.keys(body).join(",")}` });
  return NextResponse.json({ ok: true });
}
