import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { processOutbox } from "@/lib/notify";

/**
 * Scheduled outbox drain (e.g. Vercel Cron, GitHub Actions, cron-job.org).
 * Inline request processing already covers the common path; this retries jobs
 * that failed while nobody was submitting. Guarded by CRON_SECRET bearer token.
 */
export async function GET(req: Request) {
  return run(req);
}
export async function POST(req: Request) {
  return run(req);
}

async function run(req: Request) {
  const secret = process.env.CRON_SECRET || "";
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!secret || token.length !== secret.length) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let ok = false;
  try {
    ok = crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    ok = false;
  }
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await processOutbox(25);
  return NextResponse.json({ ok: true, ...result });
}
