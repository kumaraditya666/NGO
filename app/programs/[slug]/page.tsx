import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrograms, getCampaigns, getEvents, getOpportunities, getDonations, campaignRaised } from "@/lib/content";
import { ProgressBar, inr } from "@/components/ui";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: params.slug };
}
export default async function ProgramDetail({ params }: { params: { slug: string } }) {
  const programs = await getPrograms();
  const p = programs.find((x) => x.slug === params.slug && x.state === "published");
  if (!p) return notFound();
  const [campaigns, events, opps, donations] = await Promise.all([getCampaigns(), getEvents(), getOpportunities(), getDonations()]);
  const related = campaigns.filter((c) => c.programId === p.id && c.publish === "published");
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Link href="/programs" className="text-sm text-terracotta underline">← All programs</Link>
      <h1 className="font-editorial text-4xl md:text-5xl mt-3">{p.title}</h1>
      <p className="mt-2 text-forest-muted">{p.location} · Sample page — verify before launch</p>
      <img src={p.image} alt={p.title} className="mt-6 rounded-3xl border border-forest/10 w-full aspect-[21/9] object-cover" />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-forest/10 bg-white p-6"><h2 className="font-editorial text-xl">Challenge</h2><p className="mt-2 text-sm leading-relaxed">{p.challenge}</p><h2 className="font-editorial text-xl mt-5">Activities</h2><ul className="mt-2 list-disc pl-5 text-sm space-y-1">{p.activities.map((a) => <li key={a}>{a}</li>)}</ul></div>
        <div className="rounded-3xl border border-forest/10 bg-parchment p-6"><h2 className="font-editorial text-xl">Goals & verified outcomes</h2><ul className="mt-2 list-disc pl-5 text-sm space-y-1">{p.goals.map((g) => <li key={g}>{g}</li>)}</ul><p className="mt-3 text-sm text-forest-muted">{p.outcomes}</p></div>
      </div>
      {related.length > 0 && (
        <div className="mt-8"><h2 className="font-editorial text-2xl">Related campaigns</h2><div className="mt-4 grid md:grid-cols-2 gap-4">{related.map((c) => { const r = campaignRaised(c, donations); return (<Link key={c.id} href={`/campaigns/${c.slug}`} className="rounded-2xl border bg-white p-5 block"><h3 className="font-semibold">{c.title}</h3><div className="mt-2"><ProgressBar pct={(r.total / c.goalAmount) * 100} /></div><p className="text-sm mt-1">{inr(r.total)} of {inr(c.goalAmount)}</p></Link>); })}</div></div>
      )}
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/donate" className="rounded-full bg-terracotta text-white px-6 py-3 font-semibold">Donate to this program</Link><Link href="/volunteer" className="rounded-full border border-forest/25 px-6 py-3 font-semibold">Volunteer</Link></div>
      <p className="mt-4 text-sm text-forest-muted">Open volunteer roles: {opps.filter((o) => o.programId === p.id && o.open).map((o) => o.title).join(", ") || "see volunteer page"} · Events: {events.filter((e) => e.publish === "published").slice(0, 2).map((e) => e.title).join(", ")}</p>
    </div>
  );
}
