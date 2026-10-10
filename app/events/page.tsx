import EventRegister from "@/components/EventRegister";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getEvents } from "@/lib/content";
export const metadata = { title: "Events" };
export const dynamic = "force-dynamic";
export default async function Events() {
  const events = await getEvents();
  const up = events.filter((e) => e.state === "upcoming");
  const past = events.filter((e) => e.state === "past");
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><SectionHeading kicker="Events" title="Come, meet, help" /></Reveal>
      <h2 className="font-editorial text-2xl mt-8">Upcoming</h2>
      <div className="mt-4 grid md:grid-cols-2 gap-5">
        {up.map((e) => (
          <div key={e.id} className="rounded-3xl border bg-white overflow-hidden">
            <img src={e.image} alt={e.title} className="aspect-[16/8] object-cover w-full" loading="lazy" />
            <div className="p-5"><p className="text-xs uppercase tracking-widest text-terracotta">{e.date} · {e.time}</p><h3 className="font-editorial text-xl">{e.title}</h3><p className="text-sm text-forest-muted mt-1">{e.description}</p><p className="text-sm mt-2">{e.location} · <a className="underline" href={e.mapUrl} target="_blank">Map</a> · {e.registered}/{e.capacity}</p><div className="mt-3"><EventRegister eventId={e.id} /></div></div>
          </div>
        ))}
      </div>
      <h2 className="font-editorial text-2xl mt-10">Past events</h2>
      <div className="mt-4 grid md:grid-cols-2 gap-4">{past.map((e) => <div key={e.id} className="rounded-2xl border bg-parchment p-5"><p className="text-xs">{e.date}</p><h3 className="font-semibold">{e.title}</h3><p className="text-sm text-forest-muted">Recap (sample): neighbours gathered, saplings planted. Gallery coming from client photos.</p></div>)}</div>
    </div>
  );
}
