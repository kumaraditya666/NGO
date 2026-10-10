import nodemailer from "nodemailer";
import { emailConfigured } from "./config";

type Mail = { to: string; subject: string; html: string; text?: string; replyTo?: string };

export async function sendMail(m: Mail): Promise<{ demo: boolean; id?: string }> {
  if (!emailConfigured) {
    console.log(`[email:demo] to=${m.to} subject=${m.subject}`);
    return { demo: true };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "NGO <hello@example.org>",
    to: m.to,
    replyTo: m.replyTo,
    subject: m.subject,
    html: m.html,
    text: m.text || m.subject,
  });
  return { demo: false, id: info.messageId };
}
