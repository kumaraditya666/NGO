import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection } from "@/lib/store";

// Staff-only CSV export of a single inbox collection. Contains personal data —
// handle carefully, never publish or forward.
export async function GET(req: Request) {
  const g = requireApiRole(req, ["reviewer"]);
  if ("error" in g) return g.error;
  const kind = new URL(req.url).searchParams.get("kind") || "";
  if (!["volunteers", "enquiries", "inkind_pledges", "registrations"].includes(kind))
    return NextResponse.json({ error: "Bad kind" }, { status: 400 });
  const list = await readCollection<any[]>(kind, []);
  const cols = ["id", "name", "email", "phone", "status", "createdAt", "reviewedBy", "reviewedAt"];
  const extra = Array.from(new Set(list.flatMap((r) => Object.keys(r)).filter((k) => !cols.includes(k) && !["consent"].includes(k))));
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [[...cols, ...extra].join(","), ...list.map((r) => [...cols, ...extra].map((c) => esc(r[c])).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename=${kind}.csv` } });
}
