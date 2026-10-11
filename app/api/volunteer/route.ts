import { NextResponse } from "next/server";
import { volunteerSchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { adminRecipient, enqueueNotify, processOutbox, siteBase, inboxLink, esc, brandMail } from "@/lib/notify";

export async function POST(req: Request) {
  if (!rateLimit("vol:" + (req.headers.get("x-forwarded-for") || "a"), 10)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const p = volunteerSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message }, { status: 400 });
  if ((p.data.company || "").trim()) {
    // Honeypot filled: pretend success without storing anything.
    return NextResponse.json({ message: "Application saved — our team reviews every application and will be in touch.", id: "ok" });
  }
  try {
    const list = await readCollection<any[]>("volunteers", []);
    const dup = list.find(
      (x) =>
        (x.email || "") === (p.data.email || "") &&
        x.name === p.data.name &&
        (x.message || "") === (p.data.message || "") &&
        Date.now() - new Date(x.createdAt).getTime() < 120000
    );
    if (dup) return NextResponse.json({ message: "Application saved — our team reviews every application and will be in touch.", id: dup.id });
    const now = new Date().toISOString();
    const rec = { id: uid("vol"), ...p.data, formType: "volunteer", status: "new", createdAt: now };
    list.unshift(rec);
    await writeCollection("volunteers", list);

    // Notifications are best-effort: the save above is what the success message reports.
    try {
      const email = (p.data.email || "").trim();
      const admin = await adminRecipient();
      const reviewUrl = `${siteBase()}${inboxLink("volunteers")}`;
      const detail = (label: string, value: string) =>
        `<p style="margin:6px 0;"><span style="color:#5b6b76;">${label}:</span> <strong>${value || "—"}</strong></p>`;
      await enqueueNotify({
        purpose: "admin-notify",
        refKind: "volunteers",
        refId: rec.id,
        to: admin,
        subject: `New volunteer application — Shikshaa Sewa (${rec.id})`,
        html: brandMail({
          preheader: `New volunteer application from ${p.data.name}`,
          heading: "New volunteer application",
          body:
            `<p style="margin:0 0 8px 0;">A new application arrived on the website and is waiting in the inbox.</p>` +
            detail("Name", esc(p.data.name)) +
            detail("Email", esc(p.data.email) || "no email") +
            detail("Phone", esc(p.data.phone) || "no phone") +
            detail("Area", esc(p.data.location) || "no area") +
            detail("Interests", esc(p.data.interests)) +
            detail("Availability", esc(p.data.availability)) +
            (p.data.message ? `<p style="margin:10px 0 0 0;padding:10px 12px;background:#FFFCF7;border-left:3px solid #F49A20;">${esc(p.data.message)}</p>` : "") +
            `<p style="margin:10px 0 0 0;color:#5b6b76;font-size:13px;">Reference: ${esc(rec.id)}</p>`,
          ctaLabel: "Review application",
          ctaHref: reviewUrl,
          note: "Reply to this email to write directly to the applicant.",
        }),
        text: `New volunteer application (${rec.id}) on ${now}.\n${p.data.name} · ${p.data.email || "no email"} · ${p.data.phone || "no phone"}\nReview: ${siteBase()}${inboxLink("volunteers")}`,
        replyTo: (p.data.email || "").trim() || undefined,
      });
      if (email) {
        await enqueueNotify({
          purpose: "submitter-ack",
          refKind: "volunteers",
          refId: rec.id,
          to: email,
          subject: "Volunteer application received — Shikshaa Sewa",
          html: brandMail({
            preheader: "Your volunteer application is saved",
            heading: `Thanks, ${esc(p.data.name)}`,
            body:
              `<p style="margin:0 0 8px 0;">Your volunteer application is saved. Our team reads every application by hand and will be in touch.</p>` +
              `<p style="margin:0;color:#5b6b76;font-size:13px;">Your reference: ${esc(rec.id)}</p>`,
            note: "You received this because you submitted a volunteer application on our website.",
          }),
          text: `Hi ${p.data.name}, thanks — your application (${rec.id}) is saved and our team reviews every application by hand.`,
        });
      }
      await processOutbox();
    } catch (e) {
      console.error("[notify] volunteer notification failed (submission saved):", e);
    }
    return NextResponse.json({ message: "Application saved — our team reviews every application and will be in touch.", id: rec.id });
  } catch {
    return NextResponse.json({ error: "Your application could not be saved right now. Please try again, or contact us directly." }, { status: 500 });
  }
}
