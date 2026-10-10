import { NextResponse } from "next/server";
import { donationVerifySchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { enqueueNotify, processOutbox } from "@/lib/notify";
import { donationsEnabled, DONATIONS_CLOSED } from "@/lib/site";
import type { Donation } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await donationsEnabled()))
    return NextResponse.json({ error: DONATIONS_CLOSED }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for") || "anon";
  if (!rateLimit("don-verify:" + ip, 20)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const parsed = donationVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const { reference, utr, paidAt, note, cannotFindRef } = parsed.data;
  const list = await readCollection<any[]>("donations", []);
  const idx = list.findIndex((d) => d.reference === reference);
  if (idx < 0) return NextResponse.json({ error: "Donation not found" }, { status: 404 });
  const don = list[idx] as Donation & { token: string; proofFile?: string };
  if (don.status === "confirmed" || don.status === "rejected" || don.status === "cancelled")
    return NextResponse.json({ error: "Already reviewed — contact support for changes." }, { status: 409 });
  if (!cannotFindRef && !utr) return NextResponse.json({ error: "UTR is required" }, { status: 400 });
  // duplicate UTR flag (non-blocking, for reviewer)
  const dupes = list.filter((d) => d.utr && d.utr === (body.utr || "") && d.reference !== reference);
  don.utr = cannotFindRef ? "" : parsed.data.utr;
  don.paidAt = paidAt;
  (don as any).note = note || "";
  don.cannotFindRef = cannotFindRef;
  if (body.proofFile) (don as any).proofFile = body.proofFile;
  (don as any).duplicateUtr = dupes.length > 0;
  don.status = "submitted_for_verification";
  don.updatedAt = new Date().toISOString();
  list[idx] = don;
  await writeCollection("donations", list);
  const hist = await readCollection<any[]>("donation_history", []);
  hist.unshift({ id: uid("dh"), donationId: don.id, from: "awaiting_payment", to: "submitted_for_verification", by: "donor", note: cannotFindRef ? "cannot find ref" : utr, at: new Date().toISOString() });
  await writeCollection("donation_history", hist);
  await enqueueNotify({
    purpose: "donation-update",
    refKind: "donations",
    refId: `${don.id}:submitted`,
    to: don.email,
    subject: `Donation ${reference} — submitted, awaiting verification`,
    html: `<p>Hi ${don.name},</p><p>We received your reference and it is <b>awaiting payment verification</b>. We confirm only after matching the bank credit. ${dupes.length ? "Note: a similar reference exists and staff will double-check." : ""}</p>`,
    text: `Hi ${don.name}, your reference is awaiting payment verification. We confirm only after matching the bank credit.`,
  });
  await processOutbox().catch((e) => console.error("[notify] donation-verify notice failed:", e));
  return NextResponse.json({ reference, token: (don as any).token, status: don.status });
}
