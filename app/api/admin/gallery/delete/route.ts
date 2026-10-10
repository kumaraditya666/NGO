import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection } from "@/lib/store";
import { logAudit } from "@/lib/audit";
import fs from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {
  const g = requireApiRole(req, ["editor"]);
  if ("error" in g) return g.error;
  const { id, removeFiles } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const gallery = await readCollection<any[]>("gallery", []);
  const item = gallery.find((x) => x.id === id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeCollection("gallery", gallery.filter((x) => x.id !== id));
  if (removeFiles) {
    for (const key of ["image", "thumb", "file"]) {
      const rel = item[key];
      if (typeof rel === "string" && rel.startsWith("/images/gallery/")) {
        await fs.unlink(path.join(process.cwd(), "public", rel)).catch(() => {});
      }
      if (typeof rel === "string" && rel.startsWith("public/images/gallery/")) {
        await fs.unlink(path.join(process.cwd(), rel)).catch(() => {});
      }
    }
  }
  await logAudit({ by: g.session.email, action: "gallery:delete", entity: "gallery", entityId: id, detail: removeFiles ? "entry + files removed" : "entry removed, files kept" });
  return NextResponse.json({ ok: true });
}
