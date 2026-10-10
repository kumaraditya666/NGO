import Link from "next/link";
import Reveal from "@/components/Reveal";
import GalleryClient from "@/components/GalleryClient";
import VideoStories from "@/components/VideoStories";
import { getPrograms, getCampaigns, getDonations, getEvents, getGallery, getVideos } from "@/lib/content";

export const dynamic = "force-dynamic";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-brand">
      {children}
    </p>
  );
}

export default async function Home() {
  const [programs, campaigns, donations, events, gallery, videos] = await Promise.all([
    getPrograms(),
    getCampaigns(),
    getDonations(),
    getEvents(),
    getGallery(),
    getVideos(),
  ]);
  const pub = programs.filter((p) => p.state === "published");
  const featured = campaigns.find((c) => c.publish === "published" && c.state === "active");
  const onlineFor = (id: string) =>
    donations
      .filter((d) => d.status === "confirmed" && d.fundType === "campaign" && d.fundId === id)
      .reduce((s, d) => s + (d.verifiedAmount ?? d.amount), 0);
  const upcoming = events.filter((e) => e.state === "upcoming" && e.publish === "published").slice(0, 2);
  const preview = [...gallery]
    .filter((g) => g.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 8);

  return (
    <div className="bg-white font-sans">
      {/* HERO — client photograph of learning, slogan headline */}
      <section className="relative bg-slate-950 overflow-hidden" aria-label="Introduction">
        <div className="relative h-[540px] md:h-[620px]">
          <img
            src="/images/gallery/large/84ae442b-4d94-4cb7-87fc-2922382d13ee.jpg"
            alt="Children studying with notebooks on a mat while a tutor writes beside them"
            loading="eager"
            className="enter-hero-img h-full w-full object-cover md:object-[30%_50%]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 md:bg-none" />
          <div aria-hidden className="absolute inset-0 hidden md:block bg-gradient-to-l from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-0">
            <div className="mx-auto max-w-[1240px] px-5 h-full flex items-end pb-16 md:pb-0 md:items-center md:justify-end">
              <div className="max-w-xl md:pr-6">
                <p className="enter-hero-kicker font-sans text-[12px] font-bold uppercase tracking-[0.24em] text-accent">
                  Shikshaa Sewa · India
                </p>
                <h1 className="enter-hero-title font-sans mt-3 font-extrabold text-white text-[2rem] md:text-6xl leading-[1.08]">
                  Learn today,
                  <br />
                  lead tomorrow.
                </h1>
                <p className="enter-hero-sub mt-4 text-white/85 font-sans text-[15px] md:text-lg max-w-md">
                  A community-rooted nonprofit in India — explore the work, or join it
                  as a volunteer.
                </p>
                <div className="enter-hero-cta mt-6">
                  <Link
                    href="/volunteer"
                    className="inline-block rounded-md bg-accent px-9 py-3.5 font-sans font-bold text-ink hover:bg-accent-deep hover:text-white transition"
                  >
                    Become a Volunteer
                  </Link>
                  <div>
                    <Link href="/programs" className="mt-3 inline-block font-sans text-sm font-semibold text-white underline underline-offset-4 hover:text-accent">
                      Explore Our Work →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY PROGRAMS — only when published */}
      {pub.length > 0 && (
        <section aria-label="Programs" className="bg-white">
          <div className="mx-auto max-w-[1240px] px-4">
            <div className="relative z-10 -mt-12 md:-mt-24 rounded-xl bg-white shadow-[0_24px_60px_-24px_rgba(15,42,67,0.35)] border border-slate-100 p-5 md:p-6">
              <div className="grid gap-5 md:gap-7 md:grid-cols-3">
                {pub.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/programs/${p.slug}`}
                    className="group block overflow-hidden rounded-lg bg-white border border-slate-200 hover:shadow-xl transition-shadow"
                  >
                    <span className="block overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="h-52 md:h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </span>
                    <span className="flex items-stretch">
                      <span className="flex-1 bg-[#0f2a43] px-5 py-4">
                        <span className="block font-sans font-bold text-white text-[17px] leading-snug">{p.title}</span>
                        <span className="mt-1 block font-sans text-[13px] text-slate-300">{p.summary}</span>
                      </span>
                      <span className="grid w-16 shrink-0 place-items-center bg-slate-100 text-2xl text-[#0f2a43]">
                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none">→</span>
                        <span className="sr-only">Open {p.title}</span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SHORT INTRODUCTION */}
      <section className={`mx-auto max-w-[1240px] px-4 ${pub.length > 0 ? "pt-14 md:pt-20" : "pt-10 md:pt-14"}`}>
        <Reveal>
          <div className="max-w-3xl">
            <Kicker>Who We Are</Kicker>
            <h2 className="font-sans mt-2 font-extrabold text-ink text-3xl md:text-4xl leading-tight">
              Neighbours helping neighbours.
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Shikshaa Sewa Charitable Trust is a community-rooted nonprofit in India. Our full profile — mission,
              service areas, team and registration — is being confirmed with the trustees and
              will appear here once approved. What you can already see is real: photographs
              from the field, and working ways to volunteer, pledge supplies, or write to us.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/about" className="font-sans font-bold text-brand hover:text-brand-dark">About us →</Link>
              <Link href="/transparency" className="font-sans font-bold text-brand hover:text-brand-dark">How support is used →</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* WAYS TO HELP */}
      <section className="mt-14 md:mt-20 bg-cream border-y border-slate-200">
        <div className="mx-auto max-w-[1240px] px-4 py-12 md:py-16">
          <Reveal>
            <Kicker>Ways to Help</Kicker>
            <h2 className="font-sans mt-2 font-extrabold text-ink text-3xl md:text-4xl">
              Three ways to stand with us
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl">
              Online donations open only after the bank account is active. Until then, these
              actions reach the team directly.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { t: "Volunteer", b: "Give time and skills. A person reads every application and replies.", img: "/images/gallery/thumbs/84ae442b-4d94-4cb7-87fc-2922382d13ee.jpg", alt: "Children studying with notebooks on a mat while a tutor writes beside them", href: "/volunteer", cta: "Apply to Volunteer" },
              { t: "Give Supplies", b: "Offer goods the team can genuinely use. Staff review every pledge.", img: "/images/gallery/thumbs/801e6c2f-433d-4684-9a23-766093c03011.jpg", alt: "A volunteer helping a young boy try on a shirt", href: "/in-kind", cta: "Pledge Supplies" },
              { t: "Contact the Team", b: "Questions, partnerships, or anything else — write and a person responds.", img: "/images/gallery/thumbs/616425ff-9736-44ae-a30a-2848ce44878d.jpg", alt: "Volunteers and children gathered around a trust banner under a tree", href: "/contact", cta: "Get in Touch" },
            ].map((c, k) => (
              <Reveal key={c.t} delay={k * 80}>
                <Link href={c.href} className="group block h-full overflow-hidden rounded-lg bg-white border border-slate-200 hover:shadow-lg transition-shadow">
                  <span className="block overflow-hidden">
                    <img src={c.img} alt={c.alt} loading="lazy" className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                  </span>
                  <span className="block p-5">
                    <span className="font-sans font-bold text-lg text-ink">{c.t}</span>
                    <span className="mt-1 block text-sm text-slate-600 leading-relaxed">{c.b}</span>
                    <span className="mt-3 inline-block text-sm font-sans font-bold text-brand">{c.cta} →</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITY — a real published campaign, if any */}
      {featured && (
        <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
          <Reveal>
            <Kicker>Active Appeal</Kicker>
            <h2 className="font-sans mt-2 font-extrabold text-ink text-3xl md:text-4xl">{featured.title}</h2>
          </Reveal>
          <div className="mt-6 grid gap-8 md:grid-cols-2 items-center">
            <Reveal>
              <img src={featured.image} alt={featured.title} loading="lazy" className="rounded-lg w-full aspect-[16/10] object-cover border border-slate-200" />
            </Reveal>
            <Reveal delay={100}>
              <p className="text-slate-600 leading-relaxed">{featured.summary}</p>
              <p className="mt-3 text-sm font-sans font-semibold text-slate-700">
                Ends {featured.deadline} · {onlineFor(featured.id) > 0 ? `₹${onlineFor(featured.id).toLocaleString("en-IN")} confirmed through this website so far.` : "No website gifts yet — progress shown live on the appeal page."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/campaigns/${featured.slug}`} className="rounded-md bg-brand px-6 py-3 text-sm font-sans font-bold text-white hover:bg-brand-dark transition">View Appeal</Link>
                <Link href="/support" className="rounded-md border border-slate-300 px-6 py-3 text-sm font-sans font-bold text-slate-800 hover:border-slate-500 transition">Other Ways to Help</Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* GALLERY PREVIEW */}
      {preview.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <Kicker>Gallery</Kicker>
                <h2 className="font-sans mt-2 font-extrabold text-ink text-3xl md:text-4xl">
                  Moments from our work
                </h2>
              </div>
              <Link
                href="/gallery"
                className="rounded-md bg-brand px-5 py-2.5 font-sans text-sm font-bold text-white hover:bg-brand-dark transition"
              >
                View Full Gallery
              </Link>
            </div>
          </Reveal>
          <GalleryClient items={preview} showFilters={false} />
        </section>
      )}

      {/* STORIES FROM OUR WORK — only when approved videos with covers exist */}
      {videos.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
          <Reveal>
            <Kicker>Watch</Kicker>
            <h2 className="font-sans mt-2 font-extrabold text-ink text-3xl md:text-4xl">
              Stories from Our Work
            </h2>
            <div aria-hidden className="mt-3 h-1 w-16 rounded-full bg-accent" />
            <p className="mt-3 text-slate-600 max-w-2xl">
              Short videos and reels from the field. YouTube videos play here on click;
              reels open on Instagram in a new tab.
            </p>
          </Reveal>
          <div className="mt-7">
            <VideoStories items={videos} />
          </div>
        </section>
      )}

      {/* UPCOMING EVENT — only if a genuine one is published */}
      {upcoming.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
          <Reveal>
            <Kicker>Gather</Kicker>
            <h2 className="font-sans mt-2 font-extrabold text-ink text-3xl md:text-4xl">Upcoming event</h2>
          </Reveal>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {upcoming.map((e) => (
              <Reveal key={e.id}>
                <Link href="/events" className="block h-full rounded-lg border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow">
                  <p className="font-sans text-[12px] font-bold uppercase tracking-[0.18em] text-brand">{e.date} · {e.time}</p>
                  <h3 className="font-sans mt-1 font-bold text-xl text-ink">{e.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{e.location} · {e.registered}/{e.capacity} registered</p>
                  <span className="mt-3 inline-block text-sm font-sans font-bold text-brand">Register →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* VOLUNTEER CALL TO ACTION */}
      <section className="mt-14 md:mt-20 relative overflow-hidden">
        <img
          src="/images/gallery/large/f178b8e9-d772-4d48-8e81-fec77195ed39.jpg"
          alt="Eight volunteers posing outdoors with an Indian flag behind them"
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
            <Link href="/volunteer" className="mt-7 inline-block rounded-md bg-brand px-9 py-3.5 font-sans font-bold text-white hover:bg-brand-dark transition">
              Become a Volunteer
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
