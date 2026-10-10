import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/email";
import { emailConfigured } from "@/lib/config";

export async function POST(req: Request) {
  if (!rateLimit("enq:" + (req.headers.get("x-forwarded-for") || "a"), 15)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const p = enquirySchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message }, { status: 400 });
  try {
    if ((p.data.company || "").trim()) {
      // Honeypot filled: pretend success without storing anything.
      return NextResponse.json({ message: "Received — our team will get back to you.", id: "ok" });
    }
    const list = await readCollection<any[]>("enquiries", []);
    const dup = list.find(
      (x) =>
        x.email === p.data.email &&
        (x.message || "") === (p.data.message || "") &&
        Date.now() - new Date(x.createdAt).getTime() < 120000
    );
    if (dup) return NextResponse.json({ message: "Received — our team will get back to you.", id: dup.id });
    const rec = { id: uid("enq"), ...p.data, status: "new", createdAt: new Date().toISOString() };
    list.unshift(rec);
    await writeCollection("enquiries", list);
    if (p.data.kind === "inkind-pledge") {
      const pledges = await readCollection<any[]>("inkind_pledges", []);
      pledges.unshift(rec);
      await writeCollection("inkind_pledges", pledges);
    }
    if (emailConfigured) {
      await sendMail({ to: p.data.email, subject: "We received your enquiry", html: `<p>Hi ${p.data.name}, thanks for writing — we reply within 3 working days.</p>` });
    }
    return NextResponse.json({ message: "Received — our team will get back to you.", id: rec.id });
  } catch {
    return NextResponse.json({ error: "Your message could not be saved right now. Please try again later." }, { status: 500 });
  }
}
