import { NextResponse } from "next/server";
import { donationsEnabled, DONATIONS_CLOSED } from "@/lib/site";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const MAX = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "application/pdf"]);

export async function POST(req: Request) {
  if (!(await donationsEnabled()))
    return NextResponse.json({ error: DONATIONS_CLOSED }, { status: 503 });
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const reference = String(form.get("reference") || "").slice(0, 40);
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Invalid type — JPG, PNG or PDF only" }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: "File too large — max 5MB" }, { status: 400 });
    const ext = file.type === "application/pdf" ? ".pdf" : file.type.includes("png") ? ".png" : ".jpg";
    const name = `${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;
    const dir = path.join(process.cwd(), "data", "proofs");
    await fs.mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, name), buf);
    return NextResponse.json({ file: name });
  } catch (e: any) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
