import EnquiryForm from "@/components/EnquiryForm";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { readCollection } from "@/lib/store";
export const metadata = { title: "Corporate partnerships" };
export const dynamic = "force-dynamic";
export default async function Corporate() {
  const reports = await readCollection<any[]>("reports", []);
  const profile = reports.find((r: any) => r.kind === "ngo-profile");
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Corporate"
          title="Partner with care"
          lede="Workplace giving, employee volunteering and programme support — shaped around what the team can genuinely deliver."
        />
      </Reveal>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {[
          ["Workplace giving", "Payroll or event-linked giving with clear receipts."],
          ["Employee volunteering", "Team days alongside community activities."],
          ["Programme support", "Co-fund an approved programme with an open budget."],
        ].map(([t, b]) => (
          <div key={t} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-sans font-bold text-ink">{t}</h2>
            <p className="text-sm text-slate-600 mt-1">{b}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-cream p-5 text-sm text-slate-600">
        <strong className="text-ink">Case studies:</strong> published only with written partner
        approval — none published yet.{" "}
        {profile ? (
          <a href={profile.url} className="underline text-brand font-bold">Download the approved NGO profile</a>
        ) : (
          <>An approved NGO profile document will appear here. Meanwhile, <a href="/contact" className="underline text-brand font-bold">ask the team</a> for one.</>
        )}
      </div>
      <div className="mt-6"><EnquiryForm kind="partnership" /></div>
    </div>
  );
}
