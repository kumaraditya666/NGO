import { NextResponse } from "next/server";
import { readCollection } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") || "";
  const token = url.searchParams.get("token") || "";
  if (!reference || !token) return NextResponse.json({ error: "Missing reference or token" }, { status: 400 });
  const list = await readCollection<any[]>("donations", []);
  const d = list.find((x) => x.reference === reference && x.token === token);
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ reference: d.reference, amount: d.verifiedAmount ?? d.amount, status: d.status });
}
