import { NextResponse } from "next/server";
import { donationDetailsSchema } from "@/lib/validation";
import { readCollection, writeCollection, donationRef, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/email";
import { donationsEnabled, DONATIONS_CLOSED } from "@/lib/site";
import type { Donation } from "@/lib/types";
import crypto from "node:crypto";

export async function POST(req: Request) {
  if (!(await donationsEnabled()))
    return NextResponse.json({ error: DONATIONS_CLOSED }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for") || "anon";
  if (!rateLimit("don-create:" + ip, 10)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const parsed = donationDetailsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  const d = parsed.data;
  const list = await readCollection<Donation[]>("donations", []);
  const reference = donationRef();
  const token = crypto.randomBytes(24).toString("hex");
  const now = new Date().toISOString();
  const rec: Donation & { token: string } = {
    id: uid("don"), reference, name: d.name, email: d.email, phone: d.phone || "",
    fundType: d.fundType, fundId: d.fundId || "", amount: d.amount, message: d.message || "",
    anonymous: d.anonymous, status: "awaiting_payment", createdAt: now, updatedAt: now, token,
  } as any;
  list.unshift(rec);
  await writeCollection("donations", list);
  const hist = await readCollection<any[]>("donation_history", []);
  hist.unshift({ id: uid("dh"), donationId: rec.id, from: "created", to: "awaiting_payment", by: "donor", at: now });
  await writeCollection("donation_history", hist);
  await sendMail({ to: d.email, subject: `Donation ${reference} — pay, then submit reference`, html: `<p>Hi ${d.name},</p><p>Your donation reference is <b>${reference}</b> for ₹${d.amount}. Pay in your UPI/bank app, then submit your UTR on the site. This email does NOT confirm payment — staff verify every credit manually.</p><p>Private status link: /donate/status?ref=${reference}&token=${token}</p>` });
  return NextResponse.json({ reference, token, amount: d.amount, status: "awaiting_payment" });
}
