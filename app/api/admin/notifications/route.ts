import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection } from "@/lib/store";
import { retryJob, processOutbox, type NotifyJob } from "@/lib/notify";
import { logAudit } from "@/lib/audit";

// Staff-only view of the email outbox. Personal data inside — never public.
export async function GET(req: Request) {
  const g = requireApiRole(req, ["reviewer"]);
  if ("error" in g) return g.error;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "";
  let jobs = await readCollection<NotifyJob[]>("outbox", []);
  if (status) jobs = jobs.filter((j) => j.status === status);
  jobs = [...jobs].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return NextResponse.json({ jobs: jobs.slice(0, 200), count: jobs.length });
}

export async function POST(req: Request) {
  const g = requireApiRole(req, ["reviewer"]);
  if ("error" in g) return g.error;
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const job = await retryJob(String(id), g.session.email);
  if (!job) return NextResponse.json({ error: "Job not found or already delivered" }, { status: 404 });
  await logAudit({ by: g.session.email, action: "notify:retry", entity: "outbox", entityId: job.id, detail: `to=${job.to} purpose=${job.purpose}` });
  const result = await processOutbox();
  return NextResponse.json({ ok: true, job, result });
}
