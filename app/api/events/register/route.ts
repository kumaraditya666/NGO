import { NextResponse } from "next/server";
import { eventRegSchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { adminRecipient, enqueueNotify, processOutbox, siteBase, inboxLink, esc } from "@/lib/notify";

export async function POST(req: Request) {
  if (!rateLimit("evr:" + (req.headers.get("x-forwarded-for") || "a"), 20)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const p = eventRegSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    const events = await readCollection<any[]>("events", []);
    const ev = events.find((e) => e.id === p.data.eventId);
    if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    // atomic-ish capacity check: re-read, check, write
    const regs = await readCollection<any[]>("registrations", []);
    const dup = regs.find(
      (x) =>
        x.eventId === p.data.eventId &&
        x.email === p.data.email &&
        x.name === p.data.name &&
        Date.now() - new Date(x.createdAt).getTime() < 120000
    );
    if (dup) {
      const taken = regs.filter((r) => r.eventId === ev.id).reduce((s, r) => s + (r.seats || 1), 0);
      return NextResponse.json({ message: "Registered", registered: taken, capacity: ev.capacity });
    }
    const taken = regs.filter((r) => r.eventId === ev.id).reduce((s, r) => s + (r.seats || 1), 0);
    if (taken + p.data.seats > ev.capacity) return NextResponse.json({ error: "Event is full" }, { status: 409 });
    const now = new Date().toISOString();
    const rec = { id: uid("reg"), ...p.data, formType: "event-registration", status: "new", createdAt: now };
    regs.unshift(rec);
    await writeCollection("registrations", regs);
    ev.registered = taken + p.data.seats;
    await writeCollection("events", events);

    // Notifications are best-effort: the registration above is what the message reports.
    try {
      const admin = await adminRecipient();
      await enqueueNotify({
        purpose: "admin-notify",
        refKind: "event-registration",
        refId: rec.id,
        to: admin,
        subject: `New event registration — Shikshaa Sewa (${rec.id})`,
        html: `<p>New registration for <b>${esc(ev.title)}</b> (${esc(ev.date)}) on ${now}.</p><p><b>${esc(p.data.name)}</b> · ${esc(p.data.email)}${p.data.phone ? ` · ${esc(p.data.phone)}` : ""} · ${p.data.seats} seat(s)</p><p>Review: <a href="${siteBase()}${inboxLink("event-registration")}">${siteBase()}${inboxLink("event-registration")}</a></p>`,
        text: `New registration for ${ev.title} (${ev.date}) — ${rec.id} on ${now}.\n${p.data.name} · ${p.data.email} · ${p.data.seats} seat(s)\nReview: ${siteBase()}${inboxLink("event-registration")}`,
        replyTo: p.data.email,
      });
      await enqueueNotify({
        purpose: "submitter-ack",
        refKind: "event-registration",
        refId: rec.id,
        to: p.data.email,
        subject: `Registered: ${ev.title} — Shikshaa Sewa`,
          html: `<p>Hi ${esc(p.data.name)},</p><p>You are registered for <b>${esc(ev.title)}</b> (${esc(ev.date)}, ${esc(ev.time || "")}) — ${p.data.seats} seat(s), reference ${rec.id}. We look forward to seeing you.</p>`,
        text: `Hi ${p.data.name}, you are registered for ${ev.title} (${ev.date}) — ${p.data.seats} seat(s), reference ${rec.id}.`,
      });
      await processOutbox();
    } catch (e) {
      console.error("[notify] registration notification failed (registration saved):", e);
    }
    return NextResponse.json({ message: "Registered", registered: ev.registered, capacity: ev.capacity });
  } catch (e) {
    console.error("[register-debug]", e);
    return NextResponse.json({ error: "Registration could not be saved right now. Please try again." }, { status: 500 });
  }
}
