import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import VideoStories from "@/components/VideoStories";
import ProgramIcon from "@/components/ProgramIcon";
import { OrangeStroke, SunRays, BookCurve } from "@/components/Accents";
import { getPrograms, getGallery, getVideos } from "@/lib/content";

export const dynamic = "force-dynamic";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[12px] font-bold uppercase tracking-[0.22em] text-brand">
      {children}
    </p>
  );
}

const clean = (t: string) => t.replace(/\s*\(sample\)\s*$/i, "");

export default async function Home() {
  const [programs, gallery, videos] = await Promise.all([
    getPrograms(),
    getGallery(),
    getVideos(),
  ]);
  const pub = programs.filter((p) => p.state === "published");
  const byOrder = [...gallery]
    .filter((g) => g.published !== false)
    .sort((a, b) => Number(b.featured === true) - Number(a.featured === true) || (a.order ?? 0) - (b.order ?? 0));
  const curated = byOrder.slice(0, 6);
  const find = (id: string) => gallery.find((g) => g.id === id);

  const heroMain = find("g-84ae442b-4d94-4cb7-87fc-2922382d13ee");
  const heroSmall1 = find("g-801e6c2f-433d-4684-9a23-766093c03011");
  const heroSmall2 = find("g-13271238-bf80-47c0-9a26-654b2f894d7a");
  const storyMain = find("g-f178b8e9-d772-4d48-8e81-fec77195ed39");
  const storySmall1 = find("g-24633f9e-8bbf-4a58-909d-3e5cf08e9ecf");
  const storySmall2 = find("g-e95bd356-9b9a-48a8-800c-998976db2963");

  return (
    <div className="bg-cream font-sans overflow-x-clip flush-footer">
      {/* MAGAZINE HERO — cream, blue headline, photo collage */}
      <section className="relative overflow-hidden" aria-label="Introduction">
        <div className="mx-auto max-w-[1240px] px-4 pt-10 pb-12 md:pt-16 md:pb-20 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="order-1">
            <p className="enter-hero-kicker font-sans text-[12px] font-bold uppercase tracking-[0.24em] text-brand">
              Shikshaa Sewa Charitable Trust · India
            </p>
            <h1 className="enter-hero-title font-serif mt-4 font-semibold text-brand text-[2.9rem] md:text-[4.2rem] leading-[1.04]">
              Learn today,
              <br />
              <span className="relative inline-block">
                lead tomorrow.
                <svg aria-hidden="true" focusable="false" viewBox="0 0 260 18" preserveAspectRatio="none" className="enter-underline absolute -bottom-2 left-0 w-full h-[0.32em]">
                  <path d="M4 12 Q 40 4 80 10 T 150 9 T 256 10" fill="none" stroke="#F49A20" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="enter-hero-sub mt-6 text-ink/80 text-[16px] md:text-lg leading-relaxed max-w-md">
              A community-rooted nonprofit in India. Volunteers and children learn
              side by side — explore the work, or join it.
            </p>
            <div className="enter-hero-cta mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/volunteer"
                className="inline-block rounded-md bg-brand px-8 py-3.5 font-sans font-bold text-white hover:bg-brand-dark transition"
              >
                Become a Volunteer
              </Link>
              <Link href="/programs" className="font-sans text-[15px] font-bold text-brand underline underline-offset-4 hover:text-brand-dark">
                Explore Our Work →
              </Link>
            </div>
          </div>
          <div className="order-2 relative md:pl-4">
            <SunRays aria-hidden className="absolute -top-8 -right-4 w-28 md:w-36 opacity-90 pointer-events-none" />
            <div className="relative">
              {heroMain && (
                <span className="enter-photo-main block relative rounded-2xl border-[6px] border-white shadow-[0_24px_50px_-20px_rgba(23,106,154,0.45)] w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={heroMain.thumb || heroMain.image}
                    alt={heroMain.alt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </span>
              )}
              {heroSmall1 && (
                <img
                  src={heroSmall1.thumb || heroSmall1.image}
                  alt={heroSmall1.alt}
                  loading="eager"
                  className="enter-photo-1 absolute -bottom-6 -left-2 sm:left-6 w-[38%] aspect-[3/4] object-cover rounded-xl border-4 border-white shadow-xl rotate-[-3deg] motion-reduce:rotate-0"
                />
              )}
              {heroSmall2 && (
                <img
                  src={heroSmall2.thumb || heroSmall2.image}
                  alt={heroSmall2.alt}
                  loading="eager"
                  className="enter-photo-2 absolute -top-5 right-2 sm:right-8 w-[34%] aspect-square object-cover rounded-xl border-4 border-white shadow-xl rotate-[2.5deg] motion-reduce:rotate-0"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* VISUAL INTRODUCTION */}
      <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <Reveal className="relative">
            <div className="grid grid-cols-12 gap-4">
              {storyMain && (
                <img
                  src={storyMain.thumb || storyMain.image}
                  alt={storyMain.alt}
                  loading="lazy"
                  className="col-span-7 rounded-2xl border border-slate-200 shadow-md aspect-[3/4] object-cover"
                />
              )}
              <div className="col-span-5 grid gap-4 content-start pt-6 md:pt-10">
                {storySmall1 && (
                  <img
                    src={storySmall1.thumb || storySmall1.image}
                    alt={storySmall1.alt}
                    loading="lazy"
                    className="rounded-2xl border border-slate-200 shadow-md aspect-square object-cover"
                  />
                )}
                {storySmall2 && (
                  <img
                    src={storySmall2.thumb || storySmall2.image}
                    alt={storySmall2.alt}
                    loading="lazy"
                    className="rounded-2xl border border-slate-200 shadow-md aspect-[4/3] object-cover"
                  />
                )}
              </div>
            </div>
          </Reveal>
          <Reveal delay={110}>
            <Kicker>Who We Are</Kicker>
            <h2 className="font-serif mt-3 font-semibold text-ink text-3xl md:text-[2.6rem] leading-[1.12]">
              Small acts. Lasting possibilities.
            </h2>
            <OrangeStroke animate className="mt-3 h-[14px] w-44" />
            <p className="mt-5 text-ink/75 leading-relaxed">
              Shikshaa Sewa Charitable Trust serves communities through education,
              compassion and community service. From supporting children&apos;s learning
              to distributing essentials and raising awareness, we believe every small
              act of kindness can create meaningful change.
            </p>
            <p className="mt-3 text-ink/75 leading-relaxed">
              {storyMain && <span className="block text-[15px]">Above: {storyMain.alt.charAt(0).toLowerCase() + storyMain.alt.slice(1)}.</span>}
              {storySmall1 && <span className="block text-[15px] mt-1">Also: {storySmall1.alt.charAt(0).toLowerCase() + storySmall1.alt.slice(1)}.</span>}
            </p>
            <Link href="/about" className="mt-6 inline-block rounded-md bg-brand px-6 py-3 font-sans text-sm font-bold text-white hover:bg-brand-dark transition">
              Our Story
            </Link>
          </Reveal>
        </div>
      </section>

      {/* PUBLISHED PROGRAM PREVIEWS — concise preview, full list on Our Work */}
      {pub.length > 0 && (
        <section aria-label="Programs" className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <Kicker>Our Work</Kicker>
                <h2 className="font-serif mt-3 font-semibold text-ink text-3xl md:text-[2.6rem] leading-[1.12]">
                  Where we make a difference
                </h2>
              </div>
              <Link
                href="/programs"
                className="rounded-md border-2 border-brand px-5 py-2.5 font-sans text-sm font-bold text-brand hover:bg-brand hover:text-white transition"
              >
                All {pub.length} initiatives
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {pub.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <Link
                  href={`/programs/${p.slug}`}
                  className="group block h-full overflow-hidden rounded-xl bg-white border border-slate-200 hover:shadow-xl transition-shadow focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span className="block overflow-hidden">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={clean(p.title)}
                        loading="lazy"
                        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <span className="h-52 w-full grid place-items-center bg-brand text-white" role="img" aria-label={`${clean(p.title)} icon`}>
                        <ProgramIcon icon={p.icon} size={56} />
                      </span>
                    )}
                  </span>
                  <span className="block p-5">
                    <span className="font-serif font-semibold text-xl text-ink leading-snug">{clean(p.title)}</span>
                    <span className="mt-2 block text-sm text-slate-600 leading-relaxed">{p.summary}</span>
                    <span className="mt-3 inline-block text-sm font-sans font-bold text-brand transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none">Read more →</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED VIDEOS — only when published entries exist */}
      {videos.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
          <Reveal>
            <Kicker>Watch</Kicker>
            <h2 className="font-serif mt-3 font-semibold text-ink text-3xl md:text-[2.6rem] leading-[1.12]">
              Stories from Our Work
            </h2>
            <OrangeStroke animate className="mt-3 h-[14px] w-44" />
            <p className="mt-4 text-slate-600 max-w-2xl">
              Short videos and reels from the field. YouTube videos play here on click;
              reels open on Instagram in a new tab.
            </p>
          </Reveal>
          <div className="mt-7">
            <VideoStories items={videos} />
          </div>
        </section>
      )}

      {/* WAYS TO HELP — asymmetric: one large volunteer card, two small */}
      <section className="mt-14 md:mt-20 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-[1240px] px-4 py-12 md:py-16">
          <Reveal>
            <Kicker>Get Involved</Kicker>
            <h2 className="font-serif mt-3 font-semibold text-ink text-3xl md:text-[2.6rem] leading-[1.12]">
              Three ways to stand with us
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl">
              Online donations open only after the bank account is active. Until then, these
              actions reach the team directly.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Reveal className="md:row-span-2">
              <Link href="/volunteer" className="group flex h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-xl border border-slate-200 hover:shadow-xl transition-shadow focus-visible:outline-2 focus-visible:outline-brand relative">
                <img src="/images/gallery/thumbs/84ae442b-4d94-4cb7-87fc-2922382d13ee.jpg" alt="Children studying with notebooks on a mat while a tutor writes beside them" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="relative block p-6 md:p-8">
                  <span className="font-serif font-semibold text-2xl md:text-3xl text-white">Volunteer</span>
                  <span className="mt-2 block text-[15px] text-white/85 leading-relaxed">Give time and skills. A person reads every application and replies.</span>
                  <span className="mt-3 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-sans font-bold text-ink transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none">Apply to Volunteer →</span>
                </span>
              </Link>
            </Reveal>
            {[
              { t: "Give Supplies", b: "Offer goods the team can genuinely use. Staff review every pledge.", img: "/images/gallery/thumbs/801e6c2f-433d-4684-9a23-766093c03011.jpg", alt: "A volunteer helping a young boy try on a shirt", href: "/in-kind", cta: "Pledge Supplies" },
              { t: "Contact the Team", b: "Questions, partnerships, or anything else — write and a person responds.", img: "/images/gallery/thumbs/24633f9e-8bbf-4a58-909d-3e5cf08e9ecf.jpg", alt: "Three volunteers and two children standing in front of a Shikshaa Sewa Charitable Trust banner", href: "/contact", cta: "Get in Touch" },
            ].map((c, k) => (
              <Reveal key={c.t} delay={k * 90}>
                <Link href={c.href} className="group grid sm:grid-cols-[180px_1fr] h-full overflow-hidden rounded-xl bg-cream border border-slate-200 hover:shadow-lg transition-shadow focus-visible:outline-2 focus-visible:outline-brand">
                  <span className="block overflow-hidden">
                    <img src={c.img} alt={c.alt} loading="lazy" className="h-40 sm:h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                  </span>
                  <span className="block p-5">
                    <span className="font-serif font-semibold text-xl text-ink">{c.t}</span>
                    <span className="mt-1 block text-sm text-slate-600 leading-relaxed">{c.b}</span>
                    <span className="mt-3 inline-block text-sm font-sans font-bold text-brand transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none">{c.cta} →</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CURATED GALLERY — six selected photographs */}
      {curated.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <Kicker>Gallery</Kicker>
                <h2 className="font-serif mt-3 font-semibold text-ink text-3xl md:text-[2.6rem] leading-[1.12]">
                  Moments from our work
                </h2>
              </div>
              <Link
                href="/gallery"
                className="rounded-md border-2 border-brand px-5 py-2.5 font-sans text-sm font-bold text-brand hover:bg-brand hover:text-white transition"
              >
                Explore the Gallery
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[160px] sm:auto-rows-[200px]">
            {curated.slice(0, 6).map((g, k) => (
              <Reveal
                key={g.id}
                delay={(k % 3) * 80}
                className={k === 0 ? "col-span-2 row-span-2" : ""}
              >
                <Link
                  href="/gallery"
                  aria-label={`Open gallery — ${g.alt}`}
                  className="group block h-full w-full overflow-hidden rounded-xl border border-slate-200 focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <img
                    src={encodeURI(g.thumb || g.image)}
                    alt={g.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* BLUE VOLUNTEER INVITATION */}
      <section className="mt-14 md:mt-20 bg-brand">
        <div className="mx-auto max-w-[1240px] px-4 py-14 md:py-20 text-center relative overflow-hidden">
          <BookCurve aria-hidden className="absolute -left-10 top-6 w-64 opacity-60 pointer-events-none hidden md:block" />
          <BookCurve aria-hidden className="absolute -right-10 bottom-6 w-64 opacity-60 pointer-events-none hidden md:block rotate-180" />
          <Reveal>
            <h2 className="font-serif relative font-semibold text-white text-3xl md:text-5xl leading-[1.12]">
              Be part of someone&apos;s tomorrow.
            </h2>
            <p className="relative mt-4 mx-auto max-w-xl text-white/85 leading-relaxed">
              Give your time and skills alongside our volunteers. Every application is
              read by a person — and every hour matters.
            </p>
            <span className="relative mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
              <Link href="/volunteer" className="inline-block rounded-md bg-accent px-9 py-3.5 font-sans font-bold text-ink hover:bg-accent-deep hover:text-white transition">
                Become a Volunteer
              </Link>
              <Link href="/contact" className="inline-block self-center font-sans text-[15px] font-semibold text-white underline underline-offset-4 hover:text-accent">
                Contact us →
              </Link>
            </span>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
