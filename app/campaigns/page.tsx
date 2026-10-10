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
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><SectionHeading kicker="Campaigns" title="Appeals with open books" lede="Only confirmed donations move the bar. Rejected or pending gifts never count." /></Reveal>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {list.map((c) => {
          const r = campaignRaised(c, donations);
          return (
            <Link key={c.id} href={`/campaigns/${c.slug}`} className="rounded-3xl border bg-white overflow-hidden hover:shadow-panel transition block">
              <img src={c.image} alt={c.title} className="aspect-[16/8] w-full object-cover" loading="lazy" />
              <div className="p-6">
                <span className="text-[11px] uppercase tracking-widest rounded-full border px-2 py-1">{c.state}</span>
                <h2 className="font-editorial text-2xl mt-2">{c.title}</h2>
                <p className="text-sm text-forest-muted mt-1">{c.summary}</p>
                <div className="mt-3"><ProgressBar pct={(r.total / c.goalAmount) * 100} /></div>
                <p className="text-sm mt-2"><strong>{inr(r.total)}</strong> of {inr(c.goalAmount)} goal · deadline {c.deadline}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
