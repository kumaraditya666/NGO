import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { adminRecipient, enqueueNotify, processOutbox, siteBase, inboxLink, esc } from "@/lib/notify";

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
      await enqueueNotify({
        purpose: "admin-notify",
        refKind: p.data.kind,
        refId: rec.id,
        to: admin,
        subject: `New ${label} — Shikshaa Sewa (${rec.id})`,
        html: `<p>New ${label} on ${now}.</p><p><b>${esc(p.data.name)}</b> · ${esc(p.data.email)}${p.data.phone ? ` · ${esc(p.data.phone)}` : ""}</p>${p.data.subject ? `<p>Subject: ${esc(p.data.subject)}</p>` : ""}<p>${esc((p.data.message || "").slice(0, 500))}</p><p>Review: <a href="${siteBase()}${inboxLink(p.data.kind)}">${siteBase()}${inboxLink(p.data.kind)}</a></p>`,
        text: `New ${label} (${rec.id}) on ${now}.\n${p.data.name} · ${p.data.email}\n${(p.data.message || "").slice(0, 500)}\nReview: ${siteBase()}${inboxLink(p.data.kind)}`,
        replyTo: p.data.email,
      });
      await enqueueNotify({
        purpose: "submitter-ack",
        refKind: p.data.kind,
        refId: rec.id,
        to: p.data.email,
        subject: "We received your message — Shikshaa Sewa",
          html: `<p>Hi ${esc(p.data.name)},</p><p>Thanks for writing — your message (${rec.id}) is saved and we reply within 3 working days.</p>`,
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
