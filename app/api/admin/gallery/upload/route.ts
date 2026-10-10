import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { logAudit } from "@/lib/audit";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const MAX = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function slugify(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return (base || "photo") + "-" + crypto.randomBytes(4).toString("hex");
}

// Minimal JPEG/PNG dimension readers (no new dependencies).
function jpegDims(buf: Buffer): { width: number; height: number } | null {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xc3) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    if (m === 0xd8 || m === 0xd9 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) break;
    i += 2 + len;
  }
  return null;
}
function pngDims(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null;
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!sig.every((b, k) => buf[k] === b)) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export async function POST(req: Request) {
  const g = requireApiRole(req, ["editor"]);
  if ("error" in g) return g.error;
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((x) => x instanceof File) as File[];
    if (files.length === 0) return NextResponse.json({ error: "No files" }, { status: 400 });
    if (files.length > 10) return NextResponse.json({ error: "Max 10 files at once" }, { status: 400 });
    const dir = path.join(process.cwd(), "public", "images", "gallery");
    await fs.mkdir(dir, { recursive: true });
    const gallery = await readCollection<any[]>("gallery", []);
    const maxOrder = gallery.reduce((m, x) => Math.max(m, x.order ?? 0), 0);
    const added: any[] = [];
    let order = maxOrder;
    for (const f of files) {
      if (!ALLOWED.has(f.type)) return NextResponse.json({ error: `${f.name}: JPG, PNG or WebP only` }, { status: 400 });
      if (f.size > MAX) return NextResponse.json({ error: `${f.name}: max 8MB` }, { status: 400 });
      const buf = Buffer.from(await f.arrayBuffer());
      const ext = f.type === "image/png" ? ".png" : f.type === "image/webp" ? ".webp" : ".jpg";
      const slug = slugify(f.name);
      // Originals are published as uploaded; run scripts/sync-gallery.ps1 afterwards
      // to regenerate EXIF-free display versions if needed.
      await fs.writeFile(path.join(dir, slug + ext), buf);
      const dims = f.type === "image/png" ? pngDims(buf) : jpegDims(buf);
      order += 1;
      added.push({
        id: "g-" + slug,
        title: "",
        category: String(form.get("category") || "All Photos"),
        image: `/images/gallery/${slug}${ext}`,
        thumb: "",
        caption: "",
        alt: "",
        file: `public/images/gallery/${slug}${ext}`,
        width: dims?.width,
        height: dims?.height,
        order,
        published: false,
      });
    }
    gallery.push(...added);
    await writeCollection("gallery", gallery);
    await logAudit({ by: g.session.email, action: "gallery:upload", entity: "gallery", entityId: added.map((a) => a.id).join(","), detail: `${added.length} file(s), unpublished by default` });
    return NextResponse.json({ ok: true, added });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
