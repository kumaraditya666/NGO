import Link from "next/link";
import Reveal from "@/components/Reveal";
import HeroSlider from "@/components/HeroSlider";
import GalleryClient from "@/components/GalleryClient";
import { inr } from "@/components/ui";
import { getPrograms, getCampaigns, getDonations, getEvents, getGallery } from "@/lib/content";

export const dynamic = "force-dynamic";

// Working titles in data carry a "(sample)" suffix until the client confirms
// final names — stripped here so the public page reads cleanly (tracked in
// CONTENT-CHECKLIST.md). Event venues are unknown, so raw location strings
// carrying unconfirmed placeholders are not rendered on this page.
const clean = (t: string) => t.replace(/\s*\(sample\)\s*$/i, "");

const slides = [
  {
    src: "/photos/hero-children.jpg",
    alt: "Schoolchildren running and laughing outside their school",
    position: "50% 30%",
  },
  {
    src: "/photos/hero-volunteers.jpg",
    alt: "Volunteers unloading food-bank donation boxes",
    position: "50% 40%",
  },
  {
    src: "/photos/hero-community.jpg",
    alt: "Children playing together outdoors",
    position: "50% 40%",
  },
];

const cardArt: Record<string, string> = {
  "learning-foundations": "/photos/program-education.jpg",
  "community-health": "/photos/program-health.jpg",
  "livelihoods-and-environment": "/photos/program-environment.jpg",
};

const cardLine: Record<string, string> = {
  "learning-foundations": "After-school learning & libraries",
  "community-health": "Camps, care & awareness",
  "livelihoods-and-environment": "Skills, gardens & green work",
};

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-teal-700">
      {children}
    </p>
  );
}

export default async function Home() {
  const [programs, campaigns, donations, events, gallery] = await Promise.all([
    getPrograms(),
    getCampaigns(),
    getDonations(),
    getEvents(),
    getGallery(),
  ]);
  const preview = [...gallery].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 8);
  const pub = programs.filter((p) => p.state === "published").slice(0, 3);
  const featured = campaigns.find((c) => c.publish === "published" && c.state === "active");
  const onlineFor = (id: string) =>
    donations
      .filter((d) => d.status === "confirmed" && d.fundType === "campaign" && d.fundId === id)
      .reduce((s, d) => s + (d.verifiedAmount ?? d.amount), 0);
  const upcoming = events.filter((e) => e.state === "upcoming" && e.publish === "published").slice(0, 2);

  return (
    <div className="bg-white font-sans">
      <HeroSlider slides={slides} />

      {/* THREE PROGRAM CARDS overlapping the hero */}
      <section aria-label="Programs" className="bg-white">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="relative z-10 -mt-12 md:-mt-24 rounded-xl bg-white shadow-[0_24px_60px_-24px_rgba(15,42,67,0.35)] border border-slate-100 p-5 md:p-6">
            <div className="grid gap-5 md:gap-7 md:grid-cols-3">
              {pub.map((p) => (
                <Link
                  key={p.id}
                  href={`/programs/${p.slug}`}
                  className="group block overflow-hidden rounded-lg bg-white border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  <span className="block overflow-hidden">
                    <img
                      src={cardArt[p.slug] || p.image}
                      alt={`Photograph representing the ${clean(p.title)} programme`}
                      loading="lazy"
                      className="h-52 md:h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </span>
                  <span className="flex items-stretch">
                    <span className="flex-1 bg-[#0f2a43] px-5 py-4">
                      <span className="block font-sans font-bold text-white text-[17px] leading-snug">
                        {clean(p.title)}
                      </span>
                      <span className="mt-1 block font-sans text-[13px] text-slate-300">
                        {cardLine[p.slug] || p.summary}
                      </span>
                    </span>
                    <span className="grid w-16 shrink-0 place-items-center bg-slate-100 text-2xl text-[#0f2a43]">
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none">
                        →
                      </span>
                      <span className="sr-only">Open {clean(p.title)}</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT PAAJI */}
      <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20 pb-4 grid gap-8 md:grid-cols-2 items-center">
        <Reveal>
          <img
            src="/photos/about-community.jpg"
            alt="Women's self-help group meeting in a village courtyard"
            loading="lazy"
            className="rounded-lg w-full aspect-[4/3] object-cover shadow-md"
          />
        </Reveal>
        <Reveal delay={100}>
          <Kicker>About Paaji</Kicker>
          <h2 className="font-sans mt-2 font-extrabold text-slate-900 text-3xl md:text-4xl leading-tight">
            Neighbours helping neighbours.
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Paaji is a community-rooted nonprofit in India working on education,
            health and livelihoods. We keep our books open: every programme page
            shows its goals, and every donation is verified by hand before it counts.
          </p>
          <Link href="/about" className="mt-5 inline-block font-sans font-bold text-teal-700 hover:text-teal-800">
            Learn More →
          </Link>
        </Reveal>
      </section>

      {/* WAYS TO HELP */}
      <section className="mt-14 md:mt-20 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-[1240px] px-4 py-12 md:py-16">
          <Reveal>
            <Kicker>Ways to Help</Kicker>
            <h2 className="font-sans mt-2 font-extrabold text-slate-900 text-3xl md:text-4xl">
              Three ways to stand with us
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { t: "Donate", b: "Give by UPI or bank transfer. Staff verify every credit before confirming.", img: "/photos/hero-children.jpg", alt: "Schoolchildren running outside their school", href: "/donate", cta: "Support Us" },
              { t: "Volunteer", b: "Teach, organise, plant. Tell us your skills — a person replies to every application.", img: "/photos/program-environment.jpg", alt: "Young volunteers planting saplings", href: "/volunteer", cta: "Apply to Volunteer" },
              { t: "Give Supplies", b: "Books, desks and essentials from our needs list. Drop-off, or pickup where offered.", img: "/photos/hero-volunteers.jpg", alt: "Volunteers unloading food donation boxes", href: "/in-kind", cta: "See Needed Items" },
            ].map((c, k) => (
              <Reveal key={c.t} delay={k * 80}>
                <Link href={c.href} className="group block h-full overflow-hidden rounded-lg bg-white border border-slate-200 hover:shadow-lg transition-shadow">
                  <span className="block overflow-hidden">
                    <img src={c.img} alt={c.alt} loading="lazy" className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                  </span>
                  <span className="block p-5">
                    <span className="font-sans font-bold text-lg text-slate-900">{c.t}</span>
                    <span className="mt-1 block text-sm text-slate-600 leading-relaxed">{c.b}</span>
                    <span className="mt-3 inline-block text-sm font-sans font-bold text-teal-700">{c.cta} →</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PHOTO GALLERY PREVIEW — real client photos, first 8 in gallery order */}
      <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Kicker>Gallery</Kicker>
              <h2 className="font-sans mt-2 font-extrabold text-slate-900 text-3xl md:text-4xl">
                Moments from our work
              </h2>
            </div>
            <Link
              href="/gallery"
              className="rounded-md bg-teal-700 px-5 py-2.5 font-sans text-sm font-bold text-white hover:bg-teal-800 transition"
            >
              View Full Gallery
            </Link>
          </div>
        </Reveal>
        <GalleryClient items={preview} showFilters={false} />
      </section>

      {/* FEATURED CAMPAIGN */}
      {featured && (
        <section className="mt-14 md:mt-20 bg-slate-50 border-y border-slate-200">
          <div className="mx-auto max-w-[1240px] px-4 py-12 md:py-16 grid gap-8 md:grid-cols-2 items-center">
            <Reveal>
              <img
                src={cardArt[featured.programId || ""] || "/photos/hero-children.jpg"}
                alt={`Photograph for the ${clean(featured.title)} appeal`}
                loading="lazy"
                className="rounded-lg w-full aspect-[16/10] object-cover shadow-md"
              />
            </Reveal>
            <Reveal delay={100}>
              <Kicker>Featured Appeal · ends {featured.deadline}</Kicker>
              <h2 className="font-sans mt-2 font-extrabold text-slate-900 text-3xl md:text-4xl leading-tight">
                {clean(featured.title)}
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed">{featured.summary}</p>
              <p className="mt-3 text-sm font-sans font-semibold text-slate-700">
                {inr(onlineFor(featured.id))} confirmed through this website so far.
              </p>
              <p className="text-[13px] text-slate-500">
                Goals and budgets are published on the appeal page. Only confirmed gifts count.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/campaigns/${featured.slug}`} className="rounded-md bg-teal-600 px-7 py-3 font-sans font-bold text-white hover:bg-teal-700 transition">
                  View Appeal
                </Link>
                <Link href="/donate" className="rounded-md border border-slate-300 px-7 py-3 font-sans font-bold text-slate-800 hover:border-slate-500 transition">
                  Donate
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* UPCOMING EVENTS */}
      <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Kicker>Gather</Kicker>
              <h2 className="font-sans mt-2 font-extrabold text-slate-900 text-3xl md:text-4xl">
                Upcoming events
              </h2>
            </div>
            <Link href="/events" className="font-sans font-bold text-teal-700 hover:text-teal-800">
              All events →
            </Link>
          </div>
        </Reveal>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {upcoming.length === 0 && (
            <p className="text-slate-600 border border-slate-200 rounded-lg p-5 bg-white">
              No upcoming events right now — check back soon.
            </p>
          )}
          {upcoming.map((e, k) => (
            <Reveal key={e.id} delay={k * 80}>
              <Link href="/events" className="block h-full rounded-lg border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow">
                <p className="font-sans text-[12px] font-bold uppercase tracking-[0.18em] text-teal-700">
                  {e.date} · {e.time}
                </p>
                <h3 className="font-sans mt-1 font-bold text-xl text-slate-900">{clean(e.title)}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {e.registered}/{e.capacity} registered · India
                </p>
                <span className="mt-3 inline-block text-sm font-sans font-bold text-teal-700">Register →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FINAL PHOTO BANNER */}
      <section className="mt-14 md:mt-20 relative overflow-hidden">
        <img
          src="/photos/hero-volunteers.jpg"
          alt="Volunteers unloading food donation boxes"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-[#0f2a43]/75" />
        <div className="relative mx-auto max-w-[1240px] px-4 py-16 md:py-24 text-center">
          <Reveal>
            <h2 className="font-sans font-extrabold text-white text-3xl md:text-5xl leading-tight">
              Come, work beside us.
            </h2>
            <p className="mt-4 mx-auto max-w-xl text-white/85">
              Reading circles, health-camp desks, plantation mornings — bring your
              hands and your heart.
            </p>
            <Link href="/volunteer" className="mt-7 inline-block rounded-md bg-teal-600 px-9 py-3.5 font-sans font-bold text-white hover:bg-teal-500 transition">
              Become a Volunteer
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
