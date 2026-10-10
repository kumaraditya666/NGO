import { NextResponse } from "next/server";
import { volunteerSchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { adminRecipient, enqueueNotify, processOutbox, siteBase, inboxLink, esc } from "@/lib/notify";

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
      await enqueueNotify({
        purpose: "admin-notify",
        refKind: "volunteers",
        refId: rec.id,
        to: admin,
        subject: `New volunteer application — Shikshaa Sewa (${rec.id})`,
        html: `<p>New volunteer application on ${now}.</p><p><b>${esc(p.data.name)}</b> · ${esc(p.data.email) || "no email"} · ${esc(p.data.phone) || "no phone"} · ${esc(p.data.location) || "no area"}</p><p>Interests: ${esc(p.data.interests) || "—"}</p><p>Availability: ${esc(p.data.availability) || "—"}</p><p>Review: <a href="${siteBase()}${inboxLink("volunteers")}">${siteBase()}${inboxLink("volunteers")}</a></p>`,
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
          html: `<p>Hi ${esc(p.data.name)},</p><p>Thanks — your application (${rec.id}) is saved and our team reviews every application by hand.</p>`,
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
