import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection } from "@/lib/store";
import { logAudit } from "@/lib/audit";

const KINDS = ["volunteers", "enquiries", "inkind_pledges", "registrations"];

export async function GET(req: Request) {
  const g = requireApiRole(req, ["editor", "reviewer"]);
  if ("error" in g) return g.error;
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") || "volunteers";
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Bad kind" }, { status: 400 });
  const list = await readCollection<any[]>(kind, []);
  return NextResponse.json({ data: list });
}

export async function POST(req: Request) {
  const g = requireApiRole(req, ["editor", "reviewer"]);
  if ("error" in g) return g.error;
  const { kind, id, status, staffNote } = await req.json().catch(() => ({}));
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Bad kind" }, { status: 400 });
  const list = await readCollection<any[]>(kind, []);
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (typeof status === "string" && status) list[i].status = status.slice(0, 40);
  if (typeof staffNote === "string") list[i].staffNote = staffNote.slice(0, 2000);
  list[i].reviewedBy = g.session.email;
  list[i].reviewedAt = new Date().toISOString();
  await writeCollection(kind, list);
  await logAudit({ by: g.session.email, action: "inbox:update", entity: kind, entityId: id, detail: `status=${list[i].status}` });
  return NextResponse.json({ ok: true });
}
