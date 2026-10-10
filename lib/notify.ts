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
