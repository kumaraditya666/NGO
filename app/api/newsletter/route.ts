import { NextResponse } from "next/server";
import { readCollection, writeCollection, uid } from "@/lib/store";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || !String(email).includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  const list = await readCollection<any[]>("newsletter", []);
  if (list.some((x) => x.email === email)) return NextResponse.json({ message: "Already subscribed." });
  list.unshift({ id: uid("nl"), email, createdAt: new Date().toISOString() });
  await writeCollection("newsletter", list);
  return NextResponse.json({ message: "Subscribed — unsubscribe anytime by writing to us." });
}

export async function GET() {
  return NextResponse.json({ disabled: !process.env.SMTP_HOST, note: "Newsletter sends only if email is configured." });
}
