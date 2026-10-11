import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { adminRecipient, enqueueNotify, processOutbox, siteBase, inboxLink, esc, brandMail } from "@/lib/notify";

const KIND_LABEL: Record<string, string> = {
  contact: "contact enquiry",
  partnership: "partnership enquiry",
  "inkind-pledge": "supplies pledge",
  general: "enquiry",
};

export async function POST(req: Request) {
  if (!rateLimit("enq:" + (req.headers.get("x-forwarded-for") || "a"), 15)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const p = enquirySchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message }, { status: 400 });
  if ((p.data.company || "").trim()) {
    // Honeypot filled: pretend success without storing anything.
    return NextResponse.json({ message: "Received — our team will get back to you.", id: "ok" });
  }
  try {
    const list = await readCollection<any[]>("enquiries", []);
    const dup = list.find(
      (x) =>
        x.email === p.data.email &&
        (x.message || "") === (p.data.message || "") &&
        Date.now() - new Date(x.createdAt).getTime() < 120000
    );
    if (dup) return NextResponse.json({ message: "Received — our team will get back to you.", id: dup.id });
    const now = new Date().toISOString();
    const rec = { id: uid("enq"), ...p.data, formType: p.data.kind, status: "new", createdAt: now };
    list.unshift(rec);
    await writeCollection("enquiries", list);
    if (p.data.kind === "inkind-pledge") {
      const pledges = await readCollection<any[]>("inkind_pledges", []);
      pledges.unshift(rec);
      await writeCollection("inkind_pledges", pledges);
    }

    // Notifications are best-effort: the save above is what the success message reports.
    try {
      const label = KIND_LABEL[p.data.kind] || "enquiry";
      const admin = await adminRecipient();
      const reviewUrl = `${siteBase()}${inboxLink(p.data.kind)}`;
      const detail = (k: string, value: string) =>
        `<p style="margin:6px 0;"><span style="color:#5b6b76;">${k}:</span> <strong>${value || "—"}</strong></p>`;
      await enqueueNotify({
        purpose: "admin-notify",
        refKind: p.data.kind,
        refId: rec.id,
        to: admin,
        subject: `New ${label} — Shikshaa Sewa (${rec.id})`,
        html: brandMail({
          preheader: `New ${label} from ${p.data.name}`,
          heading: `New ${label}`,
          body:
            `<p style="margin:0 0 8px 0;">A new ${esc(label)} arrived on the website and is waiting in the inbox.</p>` +
            detail("Name", esc(p.data.name)) +
            detail("Email", esc(p.data.email)) +
            detail("Phone", esc(p.data.phone)) +
            (p.data.subject ? detail("Subject", esc(p.data.subject)) : "") +
            (p.data.message ? `<p style="margin:10px 0 0 0;padding:10px 12px;background:#FFFCF7;border-left:3px solid #F49A20;">${esc(p.data.message.slice(0, 500))}</p>` : "") +
            `<p style="margin:10px 0 0 0;color:#5b6b76;font-size:13px;">Reference: ${esc(rec.id)}</p>`,
          ctaLabel: "Review message",
          ctaHref: reviewUrl,
          note: "Reply to this email to write directly to the sender.",
        }),
        text: `New ${label} (${rec.id}) on ${now}.\n${p.data.name} · ${p.data.email}\n${(p.data.message || "").slice(0, 500)}\nReview: ${siteBase()}${inboxLink(p.data.kind)}`,
        replyTo: p.data.email,
      });
      await enqueueNotify({
        purpose: "submitter-ack",
        refKind: p.data.kind,
        refId: rec.id,
        to: p.data.email,
        subject: "We received your message — Shikshaa Sewa",
        html: brandMail({
          preheader: "Your message is saved",
          heading: `Thanks, ${esc(p.data.name)}`,
          body:
            `<p style="margin:0 0 8px 0;">Thanks for writing — your message is saved and we reply within 3 working days.</p>` +
            `<p style="margin:0;color:#5b6b76;font-size:13px;">Your reference: ${esc(rec.id)}</p>`,
          note: "You received this because you wrote to us through our website.",
        }),
        text: `Hi ${p.data.name}, thanks for writing — your message (${rec.id}) is saved and we reply within 3 working days.`,
      });
      await processOutbox();
    } catch (e) {
      console.error("[notify] enquiry notification failed (submission saved):", e);
    }
    return NextResponse.json({ message: "Received — our team will get back to you.", id: rec.id });
  } catch {
    return NextResponse.json({ error: "Your message could not be saved right now. Please try again later." }, { status: 500 });
  }
}
