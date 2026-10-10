import { NextResponse } from "next/server";
import { readCollection } from "@/lib/store";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("eventId") || "";
  const events = await readCollection<any[]>("events", []);
  const e = events.find((x) => x.id === id);
  if (!e) return new NextResponse("Not found", { status: 404 });
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", `UID:${e.id}@ngo`, `DTSTART:${e.date.replace(/-/g, "")}T090000`, `SUMMARY:${e.title}`, `LOCATION:${e.location}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return new NextResponse(ics, { headers: { "Content-Type": "text/calendar", "Content-Disposition": `attachment; filename="${e.slug}.ics"` } });
}
