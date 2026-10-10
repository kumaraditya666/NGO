import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
export const metadata = { title: "Corporate partnerships" };
export default function Corporate() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Reveal><SectionHeading kicker="Corporate" title="Partner with care" lede="Sample partnership options — only publish approved case studies with written consent." /></Reveal>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {[["Workplace giving", "Payroll or event-linked giving with verified receipts."], ["Employee volunteering", "Team days at learning circles, camps and drives."], ["Program support", "Co-fund a library, camp series or garden with open budgets."]].map(([t, b]) => (
          <div key={t} className="rounded-2xl border bg-white p-5"><h2 className="font-semibold">{t}</h2><p className="text-sm text-forest-muted mt-1">{b}</p></div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border bg-parchment p-5 text-sm"><strong>Approved case studies:</strong> none published yet — placeholders only. <a href="/api/profile-download" className="underline text-terracotta">Download NGO profile (sample PDF text)</a></div>
      <div className="mt-6"><EnquiryForm kind="partnership" /></div>
    </div>
  );
}
