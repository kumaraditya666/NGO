import { NextResponse } from "next/server";
import { volunteerSchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";
import { sendMail } from "@/lib/email";
import { emailConfigured } from "@/lib/config";

export async function POST(req: Request) {
  if (!rateLimit("vol:" + (req.headers.get("x-forwarded-for") || "a"), 10)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const p = volunteerSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message }, { status: 400 });
  try {
    const list = await readCollection<any[]>("volunteers", []);
    const rec = { id: uid("vol"), ...p.data, status: "new", createdAt: new Date().toISOString() };
    list.unshift(rec);
    await writeCollection("volunteers", list);
    if (p.data.email && emailConfigured) {
      await sendMail({ to: p.data.email, subject: "Volunteer application received", html: `<p>Hi ${p.data.name}, thanks — our team reviews every application by hand and will reply soon.</p>` });
    }
    return NextResponse.json({ message: "Application saved — our team reviews every application and will be in touch.", id: rec.id });
  } catch {
    return NextResponse.json({ error: "Your application could not be saved right now. Please try again, or contact us directly." }, { status: 500 });
  }
}
