import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection } from "@/lib/store";

function csv(rows: any[]): string {
  const cols = ["reference", "name", "email", "fundType", "fundId", "amount", "verifiedAmount", "status", "utr", "paidAt", "reviewer", "createdAt"];
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  // NOTE: emails/UTRs included only in staff export over authenticated session — never public
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

export async function GET(req: Request) {
  const g = requireApiRole(req, ["reviewer"]);
  if ("error" in g) return g.error;
  const list = await readCollection<any[]>("donations", []);
  return new NextResponse(csv(list), { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=donations.csv" } });
}
