import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { readCollection } from "@/lib/store";
export const metadata = { title: "Transparency" };
export const dynamic = "force-dynamic";
export default async function Transparency() {
  const reports = await readCollection<any[]>("reports", []);
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Reveal><SectionHeading kicker="Transparency" title="Open books, plain words" lede="Only client-approved documents are published. Never publish donor emails, phones, UTRs or beneficiary identities." /></Reveal>
      <div className="mt-6 rounded-3xl border bg-white p-6 text-sm leading-relaxed">
        <h2 className="font-editorial text-xl">Registration & governance (sample — verify)</h2>
        <p className="mt-2 text-forest-muted">Registration numbers, 12A/80G status and audited statements must be supplied by the client. Nothing here should be treated as a legal claim. Do not invent registrations, tax benefits or partnerships.</p>
        <h3 className="font-semibold mt-4">How donations are used</h3>
        <p>Website totals count only confirmed website donations. Offline-verified gifts are listed separately. Rejected and pending gifts never move a progress bar. Every confirmation is logged with reviewer, time and verified amount.</p>
        <h3 className="font-semibold mt-4">Reports</h3>
        {reports.length === 0 ? <p className="text-forest-muted">No reports uploaded yet — staff can add PDFs in Admin → Reports.</p> : <ul>{reports.map((r: any) => <li key={r.id}><a className="underline" href={r.url}>{r.title} ({r.year})</a></li>)}</ul>}
        <h3 className="font-semibold mt-4">Press</h3>
        <p className="text-forest-muted">Only genuine press links with permission. None published yet.</p>
      </div>
      <div id="launch-checklist" className="mt-6 rounded-3xl border border-terracotta/40 bg-parchment p-6 text-sm">
        <h2 className="font-editorial text-xl">Client-content & configuration checklist (before launch)</h2>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li>Replace [NGO NAME], [CAUSES], [LOCATION], [CONTACT DETAILS] everywhere</li>
          <li>Upload client-owned logo, documentary photos with consent, QR image (never reuse reference site's QR)</li>
          <li>Verify UPI ID + bank details (account holder, bank, number, IFSC) in Admin → Settings</li>
          <li>Replace all sample programs, campaigns, budgets, metrics, stories, testimonials with verified content</li>
          <li>Supply registration docs, annual reports, financial summaries; review privacy / donation / terms drafts</li>
          <li>Configure Supabase + SMTP env vars; create first administrator; test donation verification end-to-end</li>
          <li>Provide approved Hindi translations if the language switch is to be enabled</li>
        </ul>
      </div>
    </div>
  );
}
