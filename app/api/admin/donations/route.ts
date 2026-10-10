import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/guard";
import { readCollection, writeCollection, uid, acknowledgementNo } from "@/lib/store";
import { logAudit } from "@/lib/audit";
import { adminRecipient, enqueueNotify, processOutbox, siteBase, inboxLink, esc } from "@/lib/notify";
import type { Donation } from "@/lib/types";

export async function GET(req: Request) {
  const g = requireApiRole(req, ["reviewer", "editor"]);
  if ("error" in g) return g.error;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "";
  const q = (url.searchParams.get("q") || "").toLowerCase();
  let list = await readCollection<any[]>("donations", []);
  if (status) list = list.filter((d) => d.status === status);
  if (q) list = list.filter((d) => (d.reference + d.name + d.email + (d.utr || "")).toLowerCase().includes(q));
  // strip tokens? keep for admin but never expose publicly — admin only
  return NextResponse.json({ donations: list.slice(0, 500), count: list.length });
}

export async function POST(req: Request) {
  const g = requireApiRole(req, ["reviewer"]);
  if ("error" in g) return g.error;
  const body = await req.json().catch(() => ({}));
  const { reference, action, verifiedAmount, note } = body as { reference: string; action: "confirm" | "reject" | "cancel" | "mark_test" | "unmark_test"; verifiedAmount?: number; note?: string };
  if (!reference || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const list = await readCollection<Donation[]>("donations", []);
  const idx = list.findIndex((d) => d.reference === reference);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const d = list[idx];
  if (action === "mark_test" || action === "unmark_test") {
    d.testRecord = action === "mark_test";
    d.updatedAt = new Date().toISOString();
    list[idx] = d;
    await writeCollection("donations", list);
    await logAudit({ by: g.session.email, action: `donation:${action}`, entity: "donation", entityId: d.reference, detail: "test flag toggled" });
    return NextResponse.json({ ok: true, donation: d });
  }
  // prevent double confirmation / double counting
  if (d.status === "confirmed" && action === "confirm") return NextResponse.json({ error: "Already confirmed — no double counting." }, { status: 409 });
  if (d.status === "rejected" || d.status === "cancelled") return NextResponse.json({ error: "Already closed." }, { status: 409 });
  if (action === "confirm") {
    if (d.status !== "submitted_for_verification") return NextResponse.json({ error: "Only submitted donations can be confirmed." }, { status: 409 });
    d.verifiedAmount = Number(verifiedAmount ?? d.amount);
    if (!d.verifiedAmount || d.verifiedAmount <= 0) return NextResponse.json({ error: "Verified amount required" }, { status: 400 });
    d.status = "confirmed";
    (d as any).ackNumber = (d as any).ackNumber || acknowledgementNo();
    d.reviewer = g.session.email;
    d.reviewedAt = new Date().toISOString();
    d.internalNote = note || "";
    if (d.email) {
      await enqueueNotify({
        purpose: "donation-update",
        refKind: "donations",
        refId: `${d.id}:confirmed`,
        to: d.email,
        subject: `Donation ${d.reference} confirmed — thank you`,
        html: `<p>Hi ${esc(d.name)},</p><p>Your donation of ₹${d.verifiedAmount} (ref ${d.reference}) has been <b>confirmed</b> after verification. Acknowledgement no: ${esc((d as any).ackNumber)}. This is an acknowledgement, not a tax certificate.</p>`,
        text: `Hi ${d.name}, your donation of Rs.${d.verifiedAmount} (ref ${d.reference}) has been confirmed after verification. Acknowledgement no: ${(d as any).ackNumber}. This is an acknowledgement, not a tax certificate.`,
      });
    }
    // Staff notification ONLY after this server-side verification — never before.
    try {
      const admin = await adminRecipient();
      await enqueueNotify({
        purpose: "admin-notify",
        refKind: "donations",
        refId: `${d.id}:confirmed`,
        to: admin,
        subject: `Donation confirmed — Shikshaa Sewa (${d.reference})`,
          html: `<p>Verified by ${esc(g.session.email)} on ${d.reviewedAt}.</p><p><b>${esc(d.name)}</b> · Rs.${d.verifiedAmount} · ref ${d.reference} · UTR withheld (see dashboard).</p><p>Review: <a href="${siteBase()}${inboxLink("donations")}">${siteBase()}${inboxLink("donations")}</a></p>`,
          text: `Confirmed by ${g.session.email} on ${d.reviewedAt}: ${d.name}, Rs.${d.verifiedAmount}, ref ${d.reference}. UTR withheld — see dashboard. Review: ${siteBase()}${inboxLink("donations")}`,
        });
      await processOutbox();
    } catch (e) {
      console.error("[notify] donation-confirm notification failed (decision saved):", e);
    }
  } else if (action === "reject") {
    d.status = "rejected";
    d.reviewer = g.session.email;
    d.reviewedAt = new Date().toISOString();
    d.internalNote = note || "";
    if (d.email) {
      await enqueueNotify({
        purpose: "donation-update",
        refKind: "donations",
        refId: `${d.id}:rejected`,
        to: d.email,
        subject: `Donation ${d.reference} — needs attention`,
        html: `<p>Hi ${esc(d.name)},</p><p>We could not verify your payment (ref ${d.reference}). Reason: ${esc(note || "no matching bank credit")}. Please reply with your payment proof.</p>`,
        text: `Hi ${d.name}, we could not verify your payment (ref ${d.reference}). Reason: ${note || "no matching bank credit"}. Please reply with your payment proof.`,
      });
      await processOutbox().catch((e) => console.error("[notify] donation-reject notification failed:", e));
    }
  } else {
    d.status = "cancelled";
    d.reviewer = g.session.email;
    d.reviewedAt = new Date().toISOString();
    d.internalNote = note || "";
  }
  d.updatedAt = new Date().toISOString();
  list[idx] = d;
  await writeCollection("donations", list);
  const hist = await readCollection<any[]>("donation_history", []);
  hist.unshift({ id: uid("dh"), donationId: d.id, from: "submitted_for_verification", to: d.status, by: g.session.email, note: note || "", at: new Date().toISOString() });
  await writeCollection("donation_history", hist);
  await logAudit({ by: g.session.email, action: `donation:${action}`, entity: "donation", entityId: d.reference, detail: `amount=${(d as any).verifiedAmount ?? d.amount} note=${note || ""}` });
  return NextResponse.json({ ok: true, donation: d });
}
