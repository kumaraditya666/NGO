import { NextResponse } from "next/server";
import { volunteerSchema, enquirySchema, eventRegSchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/email";

export async function POST(req: Request) {
  if (!rateLimit("vol:" + (req.headers.get("x-forwarded-for") || "a"), 10)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const p = volunteerSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message }, { status: 400 });
  const list = await readCollection<any[]>("volunteers", []);
  const rec = { id: uid("vol"), ...p.data, status: "new", createdAt: new Date().toISOString() };
  list.unshift(rec);
  await writeCollection("volunteers", list);
  await sendMail({ to: p.data.email, subject: "Volunteer application received", html: `<p>Hi ${p.data.name}, thanks — our team reviews every application by hand and will reply soon.</p>` });
  return NextResponse.json({ message: "Application stored — our team will reply by email.", id: rec.id });
}
