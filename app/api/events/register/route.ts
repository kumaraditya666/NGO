import { NextResponse } from "next/server";
import { eventRegSchema } from "@/lib/validation";
import { readCollection, writeCollection, uid } from "@/lib/store";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit("evr:" + (req.headers.get("x-forwarded-for") || "a"), 20)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const p = eventRegSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const events = await readCollection<any[]>("events", []);
  const ev = events.find((e) => e.id === p.data.eventId);
  if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  // atomic-ish capacity check: re-read, check, write
  const regs = await readCollection<any[]>("registrations", []);
  const taken = regs.filter((r) => r.eventId === ev.id).reduce((s, r) => s + (r.seats || 1), 0);
  if (taken + p.data.seats > ev.capacity) return NextResponse.json({ error: "Event is full" }, { status: 409 });
  regs.unshift({ id: uid("reg"), ...p.data, createdAt: new Date().toISOString() });
  await writeCollection("registrations", regs);
  ev.registered = taken + p.data.seats;
  await writeCollection("events", events);
  return NextResponse.json({ message: "Registered", registered: ev.registered, capacity: ev.capacity });
}
