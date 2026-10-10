import { NextResponse } from "next/server";
import { readCollection } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") || "";
  const token = url.searchParams.get("token") || "";
  const list = await readCollection<any[]>("donations", []);
  const d = list.find((x) => x.reference === reference && x.token === token);
  if (!d) return new NextResponse("Not found", { status: 404 });
  if (d.status !== "confirmed") return new NextResponse("Acknowledgement available only after staff confirmation. Current status: " + d.status, { status: 403 });
  const settings = await readCollection<any>("settings", {});
  const text = `${settings.ngoName || "[NGO NAME]"}\nDONATION ACKNOWLEDGEMENT (not a tax certificate)\n\nAcknowledgement no: ${d.ackNumber}\nDonation reference: ${d.reference}\nDonor: ${d.anonymous ? "Anonymous (withheld from public lists)" : d.name}\nConfirmed amount: Rs.${d.verifiedAmount ?? d.amount}\nPayment date (as submitted): ${d.paidAt || "-"}\nReviewed by: ${d.reviewer || "-"} on ${d.reviewedAt || "-"}\n\nThank you for standing with our community.\n${settings.address || ""}\n\nNote: this is an acknowledgement, not a tax certificate. Tax wording requires separate client approval.`;
  return new NextResponse(text, { headers: { "Content-Type": "text/plain" } });
}
