import { readCollection, writeCollection, uid } from "./store";
import { sendMail } from "./email";
import { emailConfigured } from "./config";

export type NotifyStatus = "pending" | "sending" | "sent" | "failed";
export type NotifyPurpose = "admin-notify" | "submitter-ack" | "donation-update";

export interface NotifyJob {
  id: string;
  /** Idempotency key: one job per purpose + record. Retries reuse the job. */
  key: string;
  purpose: NotifyPurpose;
  refKind: string;
  refId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  status: NotifyStatus;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string;
  lastError?: string;
  /** Provider acceptance id (nodemailer messageId). Acceptance, not delivery. */
  messageId?: string;
  createdAt: string;
  updatedAt: string;
}

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [60_000, 600_000, 3_600_000];

export async function adminRecipient(): Promise<string> {
  const s = await readCollection<{ adminNotificationEmail?: string }>("settings", {});
  const v = (s.adminNotificationEmail || process.env.ADMIN_NOTIFICATION_EMAIL || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : "";
}

export function siteBase(): string {
  return process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/** Escape user-supplied text for HTML email bodies. */
export function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Branded email shell (email-client safe: tables + inline styles only).
 * Keeps every system mail in brand blue/orange on cream. All dynamic text
 * must be esc()-escaped by the caller before passing in.
 */
export function brandMail(opts: {
  preheader?: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  note?: string;
}): string {
  const cta =
    opts.ctaLabel && opts.ctaHref
      ? `<tr><td align="center" style="padding:8px 32px 4px 32px;"><a href="${opts.ctaHref}" style="display:inline-block;background:#F49A20;color:#20313D;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:6px;">${opts.ctaLabel}</a></td></tr>`
      : "";
  const note = opts.note
    ? `<tr><td style="padding:12px 32px 28px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#5b6b76;">${opts.note}</td></tr>`
    : `<tr><td style="padding:0 32px 28px 32px;"></td></tr>`;
  return (
    `<!doctype html><html><body style="margin:0;padding:0;background:#FFFCF7;">` +
    (opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>` : "") +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFCF7;padding:24px 12px;">` +
    `<tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e3ddd2;border-radius:10px;overflow:hidden;">` +
    `<tr><td style="background:#176A9A;padding:20px 32px;"><div style="font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#ffffff;">Shikshaa Sewa Charitable Trust</div><div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-style:italic;color:#cfe3ef;margin-top:2px;">Learn today, lead tomorrow</div></td></tr>` +
    `<tr><td style="padding:24px 32px 4px 32px;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#20313D;">${opts.heading}</td></tr>` +
    `<tr><td style="padding:8px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#33454f;">${opts.body}</td></tr>` +
    cta + note +
    `</table>` +
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8a979f;padding:14px 8px 0 8px;">Shikshaa Sewa Charitable Trust · A community-rooted nonprofit in India.</div>` +
    `</td></tr></table></body></html>`
  );
}

function keyFor(purpose: NotifyPurpose, refKind: string, refId: string): string {
  return `${purpose}:${refKind}:${refId}`;
}

/** Create a job unless an equivalent one already exists (no duplicates). */
export async function enqueueNotify(input: {
  purpose: NotifyPurpose;
  refKind: string;
  refId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<NotifyJob> {
  const jobs = await readCollection<NotifyJob[]>("outbox", []);
  const key = keyFor(input.purpose, input.refKind, input.refId);
  const existing = jobs.find((j) => j.key === key);
  if (existing) return existing;
  const now = new Date().toISOString();
  const job: NotifyJob = {
    id: uid("mail"),
    key,
    purpose: input.purpose,
    refKind: input.refKind,
    refId: input.refId,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
    status: "pending",
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  };
  jobs.unshift(job);
  await writeCollection("outbox", jobs);
  return job;
}

function backoff(attempts: number): string {
  const ms = BACKOFF_MS[Math.min(attempts, BACKOFF_MS.length - 1)];
  return new Date(Date.now() + ms).toISOString();
}

/**
 * Process due jobs inline (awaited by request handlers so serverless works).
 * Bounded retries; a failed email never touches the saved submission.
 * Returns counts for logging/tests. sendMail is only called when a provider
 * is configured — demo mode is recorded as failure, never as success.
 */
export async function processOutbox(limit = 5): Promise<{ processed: number; sent: number; failed: number }> {
  const jobs = await readCollection<NotifyJob[]>("outbox", []);
  const now = Date.now();
  const due = jobs
    .filter((j) => j.status === "pending" || (j.status === "failed" && j.attempts < j.maxAttempts && new Date(j.nextAttemptAt).getTime() <= now))
    .slice(0, limit);
  let sent = 0;
  let failed = 0;
  for (const job of due) {
    job.status = "sending";
    job.updatedAt = new Date().toISOString();
    await writeCollection("outbox", jobs);
    try {
      if (!job.to || !job.to.includes("@")) throw new Error("no admin recipient configured (set ADMIN_NOTIFICATION_EMAIL or Settings > adminNotificationEmail)");
      if (!emailConfigured && !process.env.RESEND_API_KEY) throw new Error("email provider not configured (set RESEND_API_KEY or SMTP_HOST/USER/PASS)");
      const info = await sendMail({ to: job.to, subject: job.subject, html: job.html, text: job.text, replyTo: job.replyTo });
      if (info.demo) throw new Error("email provider not configured (demo mode)");
      job.status = "sent";
      job.messageId = info.id;
      job.lastError = undefined;
      sent += 1;
    } catch (e: any) {
      job.attempts += 1;
      job.lastError = String(e?.message || e).slice(0, 300);
      if (job.attempts >= job.maxAttempts) {
        job.status = "failed";
      } else {
        job.status = "failed";
        job.nextAttemptAt = backoff(job.attempts);
      }
      failed += 1;
    }
    job.updatedAt = new Date().toISOString();
    await writeCollection("outbox", jobs);
  }
  return { processed: due.length, sent, failed };
}

/** Manual retry by staff: fresh bounded cycle on the SAME job (no duplicates). */
export async function retryJob(id: string, by: string): Promise<NotifyJob | null> {
  const jobs = await readCollection<NotifyJob[]>("outbox", []);
  const job = jobs.find((j) => j.id === id);
  if (!job || job.status === "sent" || job.status === "sending") return job || null;
  job.status = "pending";
  job.attempts = 0;
  job.nextAttemptAt = new Date().toISOString();
  job.lastError = `Retried by ${by} at ${new Date().toISOString()}`;
  job.updatedAt = new Date().toISOString();
  await writeCollection("outbox", jobs);
  return job;
}

export function inboxLink(kind: string): string {
  const map: Record<string, string> = {
    volunteers: "volunteers",
    contact: "enquiries",
    partnership: "enquiries",
    "inkind-pledge": "inkind_pledges",
    general: "enquiries",
    "event-registration": "registrations",
    donations: "donations",
  };
  const tab = map[kind] || "enquiries";
  return tab === "donations" ? "/admin/dashboard/donations" : `/admin/dashboard/inbox?kind=${tab}`;
}
