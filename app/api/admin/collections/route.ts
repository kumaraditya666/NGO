import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection } from "@/lib/store";
import { logAudit } from "@/lib/audit";

const EDITOR_SETS = new Set(["programs", "campaigns", "campaign_updates", "events", "stories", "articles", "gallery", "videos", "testimonials", "team", "reports", "faqs", "opportunities", "inkind_items"]);
const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const IG_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

function videoError(v: any): string | null {
  if (!v || typeof v !== "object") return "Each video must be an object.";
  if (!v.id || !v.title) return "Each video needs an id and title.";
  if (typeof v.url !== "string" || !v.url.startsWith("https://")) return `Video "${v.id}": URL must start with https://.`;
  let host = "";
  try {
    host = new URL(v.url).hostname.toLowerCase().replace(/^m\./, "");
  } catch {
    return `Video "${v.id}": URL is not valid.`;
  }
  if (v.platform === "youtube" && !YT_HOSTS.has(host))
    return `Video "${v.id}": YouTube items must link to youtube.com or youtu.be.`;
  if (v.platform === "instagram" && !IG_HOSTS.has(host))
    return `Video "${v.id}": Instagram items must link to instagram.com.`;
  if (v.platform !== "youtube" && v.platform !== "instagram")
    return `Video "${v.id}": platform must be "youtube" or "instagram".`;
  if (typeof v.cover !== "string" || !v.cover.startsWith("/"))
    return `Video "${v.id}": cover must be an uploaded site image path (starts with /).`;
  return null;
}
const REVIEWER_SETS = new Set(["volunteers", "registrations", "enquiries", "inkind_pledges"]);

export async function GET(req: Request) {
  const g = requireApiRole(req, ["editor", "reviewer"]);
  if ("error" in g) return g.error;
  const name = new URL(req.url).searchParams.get("name") || "";
  const allowed = g.session.role === "administrator" || EDITOR_SETS.has(name) || REVIEWER_SETS.has(name) || ["donations", "audit", "settings", "staff", "newsletter"].includes(name);
  if (!allowed && g.session.role !== "administrator") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = await readCollection<any>(name, Array.isArray([]) ? [] : {});
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const g = requireApiRole(req, ["editor", "reviewer"]);
  if ("error" in g) return g.error;
  const body = await req.json().catch(() => ({}));
  const { name, data, action } = body as { name: string; data: any; action?: string };
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
  // permission matrix
  const role = g.session.role;
  if (role !== "administrator") {
    if (EDITOR_SETS.has(name) && role !== "editor") return NextResponse.json({ error: "Editors only" }, { status: 403 });
    if (REVIEWER_SETS.has(name) && role !== "reviewer" && role !== "editor") return NextResponse.json({ error: "Reviewers only" }, { status: 403 });
    if (["settings", "staff", "audit"].includes(name)) return NextResponse.json({ error: "Administrators only" }, { status: 403 });
    if (name === "donations") return NextResponse.json({ error: "Use donation review queue" }, { status: 403 });
  }
  if (name === "settings" || name === "staff") return NextResponse.json({ error: "Use dedicated endpoint" }, { status: 400 });
  if (name === "videos") {
    if (!Array.isArray(data)) return NextResponse.json({ error: "Videos must be a list." }, { status: 400 });
    for (const v of data) {
      const err = videoError(v);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }
  }
  await writeCollection(name, data);
  await logAudit({ by: g.session.email, action: `content:save:${action || "update"}`, entity: name, entityId: "-", detail: `items=${Array.isArray(data) ? data.length : 1}` });
  return NextResponse.json({ ok: true });
}
