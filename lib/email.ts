import nodemailer from "nodemailer";
import { Resend } from "resend";
import { emailConfigured } from "./config";

type Mail = { to: string; subject: string; html: string; text?: string; replyTo?: string };

function sender(): string {
  return process.env.EMAIL_FROM || process.env.SMTP_FROM || "NGO <hello@example.org>";
}

async function sendViaResend(m: Mail): Promise<string> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: sender(),
    to: m.to,
    replyTo: m.replyTo,
    subject: m.subject,
    html: m.html,
    text: m.text || m.subject,
  });
  if (error) throw new Error(`Resend rejected the message: ${error.message || JSON.stringify(error).slice(0, 200)}`);
  if (!data?.id) throw new Error("Resend accepted the message without an id");
  return data.id;
}

async function sendViaSmtp(m: Mail): Promise<string> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const info = await transporter.sendMail({
    from: sender(),
    to: m.to,
    replyTo: m.replyTo,
    subject: m.subject,
    html: m.html,
    text: m.text || m.subject,
  });
  return info.messageId;
}

/**
 * Sends one email, Resend first, SMTP fallback. Throws when nothing is
 * configured or the provider refuses — callers (the outbox processor) record
 * that honestly instead of pretending delivery happened.
 */
export async function sendMail(m: Mail): Promise<{ demo: boolean; id?: string }> {
  if (process.env.RESEND_API_KEY) {
    return { demo: false, id: await sendViaResend(m) };
  }
  if (emailConfigured) {
    return { demo: false, id: await sendViaSmtp(m) };
  }
  console.log(`[email:demo] to=${m.to} subject=${m.subject}`);
  return { demo: true };
}
