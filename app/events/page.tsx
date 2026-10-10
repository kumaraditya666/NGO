import Link from "next/link";
import EventRegister from "@/components/EventRegister";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getEvents } from "@/lib/content";
export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";
export default async function Events() {
  const events = await getEvents();
  const up = events.filter((e) => e.state === "upcoming" && e.publish === "published");
  const past = events.filter((e) => e.state === "past" && e.publish === "published");
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Events"
          title="Come, meet, help"
          lede="Only confirmed events with real dates and venues appear here."
        />
      </Reveal>
      <h2 className="font-sans font-bold text-2xl mt-8 text-ink">Upcoming</h2>
      {up.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-cream p-6 text-slate-600">
          No events published yet. When the team confirms dates and venues, they will appear
          here with registration. <Link href="/contact" className="font-bold text-brand underline">Ask us what&apos;s coming up</Link>.
        </p>
      ) : (
        <div className="mt-4 grid md:grid-cols-2 gap-5">
          {up.map((e) => (
            <div key={e.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <img src={e.image} alt={e.title} className="aspect-[16/8] object-cover w-full" loading="lazy" />
              <div className="p-5">
                <p className="font-sans text-[12px] font-bold uppercase tracking-widest text-brand">{e.date} · {e.time}</p>
                <h3 className="font-sans font-bold text-xl text-ink">{e.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{e.description}</p>
                <p className="text-sm mt-2 text-slate-700">{e.location} · <a className="underline text-brand" href={e.mapUrl} target="_blank">Map</a> · {e.registered}/{e.capacity}</p>
                <div className="mt-3"><EventRegister eventId={e.id} /></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {past.length > 0 && (
        <>
          <h2 className="font-sans font-bold text-2xl mt-10 text-ink">Past events</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {past.map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-200 bg-cream p-5">
                <p className="text-xs text-slate-500">{e.date}</p>
                <h3 className="font-sans font-bold text-ink">{e.title}</h3>
                <p className="text-sm text-slate-600">{e.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
