import { NextResponse } from "next/server";
import { readCollection } from "@/lib/store";
export async function GET() {
  const s = await readCollection<any>("settings", {});
  const text = `${s.ngoName || "[NGO NAME]"} — NGO profile (sample)\n\nContact: ${s.contactEmail} ${s.contactPhone}\nAddress: ${s.address}\n\nPrograms, budgets and reports available on request. Sample document — replace with client-approved PDF.`;
  return new NextResponse(text, { headers: { "Content-Type": "text/plain", "Content-Disposition": "attachment; filename=ngo-profile.txt" } });
}
