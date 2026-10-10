import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection } from "@/lib/store";

export async function GET(req: Request) {
  const g = requireApiRole(req, ["reviewer"]);
  if ("error" in g) return g.error;
  const file = new URL(req.url).searchParams.get("file") || "";
  if (!file || file.includes("..") || file.includes("/")) return NextResponse.json({ error: "Bad file" }, { status: 400 });
  const donations = await readCollection<any[]>("donations", []);
  if (!donations.some((d) => d.proofFile === file)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  try {
    const buf = await fs.readFile(path.join(process.cwd(), "data", "proofs", file));
    const type = file.endsWith(".pdf") ? "application/pdf" : file.endsWith(".png") ? "image/png" : "image/jpeg";
    return new NextResponse(buf as any, { headers: { "Content-Type": type } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
