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
  const openRoles = opps.filter((o) => o.programId === p.id && o.open);
  const upcoming = events.filter((e) => e.publish === "published" && e.state === "upcoming").slice(0, 2);
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 font-sans">
      <Link href="/programs" className="text-sm font-bold text-brand underline">← All programmes</Link>
      <h1 className="font-sans font-extrabold text-ink text-4xl md:text-5xl mt-3">{p.title}</h1>
      <p className="mt-2 text-slate-600">{p.location}</p>
      <img src={p.image} alt={p.title} className="mt-6 rounded-xl border border-slate-200 w-full aspect-[21/9] object-cover" />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-sans font-bold text-xl text-ink">The need</h2>
          <p className="mt-2 text-[15px] text-slate-600 leading-relaxed">{p.challenge}</p>
          <h2 className="font-sans font-bold text-xl text-ink mt-5">Activities</h2>
          <ul className="mt-2 list-disc pl-5 text-[15px] text-slate-600 space-y-1">{p.activities.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-cream p-6">
          <h2 className="font-sans font-bold text-xl text-ink">Goals and outcomes</h2>
          <ul className="mt-2 list-disc pl-5 text-[15px] text-slate-600 space-y-1">{p.goals.map((g) => <li key={g}>{g}</li>)}</ul>
          <p className="mt-3 text-[15px] text-slate-600">{p.outcomes}</p>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="font-sans font-bold text-2xl text-ink">Related appeals</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {related.map((c) => {
              const r = campaignRaised(c, donations);
              return (
                <Link key={c.id} href={`/campaigns/${c.slug}`} className="rounded-xl border border-slate-200 bg-white p-5 block hover:shadow-lg transition">
                  <h3 className="font-sans font-bold text-ink">{c.title}</h3>
                  <div className="mt-2"><ProgressBar pct={(r.total / c.goalAmount) * 100} /></div>
                  <p className="text-sm mt-1 text-slate-600">{inr(r.total)} of {inr(c.goalAmount)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/support" className="rounded-md bg-brand text-white px-6 py-3 text-sm font-sans font-bold hover:bg-brand-dark transition">Support This Work</Link>
        <Link href="/volunteer" className="rounded-md border border-slate-300 px-6 py-3 text-sm font-sans font-bold text-slate-800 hover:border-slate-500 transition">Volunteer</Link>
      </div>
      {(openRoles.length > 0 || upcoming.length > 0) && (
        <p className="mt-4 text-sm text-slate-600">
          {openRoles.length > 0 && <>Open roles: {openRoles.map((o) => o.title).join(", ")}. </>}
          {upcoming.length > 0 && <>Upcoming: {upcoming.map((e) => e.title).join(", ")}.</>}
        </p>
      )}
    </div>
  );
}
