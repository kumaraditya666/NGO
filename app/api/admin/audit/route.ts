import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection } from "@/lib/store";
export async function GET(req: Request) {
  const g = requireApiRole(req, ["editor", "reviewer"]);
  if ("error" in g) return g.error;
  const audit = await readCollection<any[]>("audit", []);
  return NextResponse.json({ audit: audit.slice(0, 300) });
}
