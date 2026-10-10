import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SectionHeading, ProgressBar, inr } from "@/components/ui";
import { getCampaigns, getDonations, campaignRaised } from "@/lib/content";
export const metadata = { title: "Campaigns" };
export const dynamic = "force-dynamic";
export default async function Campaigns() {
  const [campaigns, donations] = await Promise.all([getCampaigns(), getDonations()]);
  const list = campaigns.filter((c) => c.publish === "published");
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Campaigns"
          title="Appeals"
          lede="Only confirmed donations move a progress bar. Pending and rejected gifts never count."
        />
      </Reveal>
      {list.length === 0 ? (
        <Reveal>
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="font-sans font-bold text-lg text-slate-900">No active appeals right now</p>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              Online donations are also still being set up. You can already volunteer,
              pledge supplies, or contact the team.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/support" className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-sans font-bold text-white hover:bg-teal-800 transition">Ways to Help</Link>
              <Link href="/gallery" className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-sans font-bold text-slate-800 hover:border-slate-500 transition">See the Work</Link>
            </div>
          </div>
        </Reveal>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {list.map((c) => {
            const r = campaignRaised(c, donations);
            return (
              <Link key={c.id} href={`/campaigns/${c.slug}`} className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition block">
                <img src={c.image} alt={c.title} className="aspect-[16/8] w-full object-cover" loading="lazy" />
                <div className="p-6">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-widest rounded-full border border-slate-300 px-2 py-1 text-slate-600">{c.state}</span>
                  <h2 className="font-sans font-bold text-2xl mt-2 text-slate-900">{c.title}</h2>
                  <p className="text-sm text-slate-600 mt-1">{c.summary}</p>
                  <div className="mt-3"><ProgressBar pct={(r.total / c.goalAmount) * 100} /></div>
                  <p className="text-sm mt-2 text-slate-700"><strong>{inr(r.total)}</strong> of {inr(c.goalAmount)} goal · deadline {c.deadline}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
