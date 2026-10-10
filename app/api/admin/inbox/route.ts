import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection } from "@/lib/store";

export async function GET(req: Request) {
  const g = requireApiRole(req, ["editor", "reviewer"]);
  if ("error" in g) return g.error;
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") || "volunteers";
  if (!["volunteers", "enquiries", "inkind_pledges", "registrations"].includes(kind)) return NextResponse.json({ error: "Bad kind" }, { status: 400 });
  const list = await readCollection<any[]>(kind, []);
  return NextResponse.json({ data: list });
}

export async function POST(req: Request) {
  const g = requireApiRole(req, ["editor", "reviewer"]);
  if ("error" in g) return g.error;
  const { kind, id, status } = await req.json().catch(() => ({}));
  const list = await readCollection<any[]>(kind, []);
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  list[i].status = status;
  await writeCollection(kind, list);
  return NextResponse.json({ ok: true });
}
