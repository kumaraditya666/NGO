import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { readCollection, writeCollection } from "@/lib/store";
import { sendMail } from "@/lib/email";
import { emailConfigured } from "@/lib/config";
import { rateLimit } from "@/lib/rate-limit";
import type { StaffUser } from "@/lib/auth";

// Self-service reset request. Always responds generically; a token is issued
// and emailed only when the account exists AND email delivery is configured.
export async function POST(req: Request) {
  if (!rateLimit("pw-forgot:" + (req.headers.get("x-forwarded-for") || "a"), 5))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string")
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  if (!emailConfigured) {
    return NextResponse.json({
      message: "Password-reset emails are not configured on this site. Please ask your administrator to set a new password for you.",
      delivered: false,
    });
  }
  const staff = await readCollection<StaffUser[]>("staff", []);
  const u = staff.find((s) => s.email === email.trim().toLowerCase());
  if (u) {
    const token = crypto.randomBytes(32).toString("hex");
    u.resetHash = crypto.createHash("sha256").update(token).digest("hex");
    u.resetExp = Date.now() + 1000 * 60 * 60;
    await writeCollection("staff", staff);
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await sendMail({
      to: u.email,
      subject: "Reset your admin password",
      html: `<p>Hi ${u.name},</p><p>A password reset was requested. This link works for one hour:</p><p><a href="${base}/admin/reset?token=${token}">${base}/admin/reset?token=${token}</a></p><p>If you did not ask for this, ignore this email.</p>`,
    });
  }
  return NextResponse.json({
    message: "If that staff account exists, a reset link is on its way (valid one hour).",
    delivered: true,
  });
}
