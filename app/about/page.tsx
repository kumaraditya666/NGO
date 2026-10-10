import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getTeam } from "@/lib/content";

export const metadata = { title: "About" };

export default async function About() {
  const team = await getTeam();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><SectionHeading kicker="About" title="Mission, vision and the people behind them" lede="Sample copy throughout — replace with client-approved text before launch." /></Reveal>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          ["Mission (sample)", "To stand with families in [LOCATION] on learning, health and dignified livelihoods — openly and accountably."],
          ["Vision (sample)", "A neighbourhood where every child learns, every mother is cared for, and work restores the land."],
          ["Values (sample)", "Consent first · Verify everything · Small promises, kept · Neighbours lead."],
        ].map(([t, b]) => (
          <div key={t} className="rounded-3xl border border-forest/10 bg-white p-6"><h2 className="font-editorial text-xl">{t}</h2><p className="mt-2 text-sm text-forest-muted leading-relaxed">{b}</p></div>
        ))}
      </div>
      <Reveal>
        <div className="mt-8 rounded-3xl bg-forest text-ivory p-6 md:p-10">
          <h2 className="font-editorial text-2xl">Founder's message (sample)</h2>
          <p className="mt-3 text-ivory/80 leading-relaxed">“We started with one reading circle and a borrowed shelf. Everything since — every camp, every sapling — has been carried by neighbours. This website exists to keep that trust visible: what we collect, what we spend, what changed.” — Founder Name (sample, replace)</p>
        </div>
      </Reveal>
      <div className="mt-10">
        <h2 className="font-editorial text-2xl">Milestones (sample — verify before launch)</h2>
        <ol className="mt-4 space-y-3 border-l-2 border-gold pl-5">
          {[["2023", "First learning circle opens"], ["2024", "Monthly health camps begin"], ["2025", "Kitchen gardens + plantation drives"], ["2026", "This website: verified donation tracking"]].map(([y, e]) => (
            <li key={y}><strong>{y}</strong> — {e}</li>
          ))}
        </ol>
      </div>
      <div className="mt-10">
        <h2 className="font-editorial text-2xl">Team & trustees</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {team.map((m) => (
            <div key={m.id} className="rounded-2xl border border-forest/10 bg-white p-5"><p className="font-semibold">{m.name}</p><p className="text-sm text-terracotta">{m.role}{m.trustee ? " · Trustee" : ""}</p><p className="text-sm text-forest-muted mt-2">{m.bio}</p></div>
          ))}
        </div>
      </div>
      <div className="mt-10 rounded-2xl border border-forest/10 bg-parchment p-6">
        <h2 className="font-editorial text-2xl">Areas served</h2>
        <p className="mt-2 text-sm text-forest-muted">[LOCATION] and nearby wards — exact list to be confirmed by client. No invented coverage is claimed as fact.</p>
      </div>
    </div>
  );
}
