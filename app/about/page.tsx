import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import ProgramIcon from "@/components/ProgramIcon";
import { OrangeStroke, BookCurve } from "@/components/Accents";
import { SectionHeading } from "@/components/ui";
import { getPrograms } from "@/lib/content";
import { readCollection } from "@/lib/store";
import { siteConfig } from "@/lib/config";

export const metadata = {
  title: "About Shikshaa Sewa Charitable Trust",
  description: "About Shikshaa Sewa Charitable Trust — education, compassion and community service in India.",
};
export const dynamic = "force-dynamic";

const smallActs = [
  { id: "g-4d26bc6b-9b2b-4e1b-99db-de1516bb2fdc", src: "/images/gallery/thumbs/4d26bc6b-9b2b-4e1b-99db-de1516bb2fdc.jpg", alt: "Children wearing prize medals posing with volunteers indoors" },
  { id: "g-96c63849-5afb-4c47-9c16-2d91901c8300", src: "/images/gallery/thumbs/96c63849-5afb-4c47-9c16-2d91901c8300.jpg", alt: "A volunteer posing with three children outdoors" },
];

export default async function About() {
  const settings = await readCollection<any>("settings", {});
  const display = settings.displayName || settings.ngoName || siteConfig.name;
  const legal = (settings.legalName || "").trim();
  const programs = (await getPrograms()).filter((p) => p.state === "published");

  return (
    <div className="bg-cream font-sans overflow-x-clip">
      {/* 1. INTRODUCTION */}
      <section className="mx-auto max-w-[1240px] px-4 pt-12 md:pt-16 pb-4 grid gap-8 md:grid-cols-2 md:items-center">
        <div className="order-1">
          <Reveal>
            <p className="font-sans text-[12px] font-bold uppercase tracking-[0.24em] text-brand">
              About Shikshaa Sewa
            </p>
            <h1 className="font-serif mt-4 font-semibold text-brand text-[2.6rem] md:text-6xl leading-[1.06]">
              Education. Compassion. Community.
            </h1>
            <p className="mt-6 text-ink/80 text-[16px] md:text-lg leading-relaxed max-w-lg">
              Shikshaa Sewa Charitable Trust is a charitable trust dedicated to creating
              positive change in society through education, compassion, and community service.
            </p>
          </Reveal>
        </div>
        <Reveal delay={120} className="order-2">
          <span className="block relative rounded-2xl border-[6px] border-white shadow-[0_24px_50px_-20px_rgba(23,106,154,0.45)] w-full aspect-[4/3] overflow-hidden">
            <Image
              src="/images/gallery/large/f178b8e9-d772-4d48-8e81-fec77195ed39.jpg"
              alt="Eight volunteers posing outdoors with an Indian flag behind them"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </span>
        </Reveal>
      </section>

      {/* 2. MOTTO */}
      <section className="mt-14 md:mt-20 bg-brand">
        <div className="mx-auto max-w-[1240px] px-4 py-12 md:py-16 text-center">
          <Reveal>
            <p className="font-sans text-[12px] font-bold uppercase tracking-[0.24em] text-accent">Our Motto</p>
            <h2 className="font-serif mt-3 font-semibold text-white text-3xl md:text-5xl leading-[1.1]">
              Learn Today, Lead Tomorrow.
            </h2>
            <div aria-hidden className="mx-auto mt-4 h-[6px] w-40 rounded-full bg-accent" />
            <p className="mt-5 mx-auto max-w-2xl text-white/85 text-[16px] md:text-lg leading-relaxed">
              Our motto reflects our belief that education, awareness, and collective action
              can build a better future for everyone.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. MEANING OF SEWA */}
      <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20 grid gap-8 md:grid-cols-2 md:items-center">
        <Reveal className="order-2 md:order-1">
          <img
            src="/images/gallery/large/4bd5e97f-73b6-41ea-b076-8c620c666d89.jpg"
            alt="Volunteers and children posing for a group photo with a dog"
            loading="lazy"
            className="rounded-2xl border border-slate-200 shadow-md w-full aspect-[4/3] object-cover"
          />
        </Reveal>
        <Reveal delay={110} className="order-1 md:order-2">
          <h2 className="font-serif font-semibold text-ink text-3xl md:text-[2.6rem] leading-[1.12]">
            Sewa has no boundaries.
          </h2>
          <BookCurve aria-hidden className="mt-3 h-[26px] w-64 opacity-80" />
          <p className="mt-5 text-ink/75 text-[16px] md:text-lg leading-relaxed">
            At Shikshaa Sewa Charitable Trust, we believe that Sewa has no boundaries. It is
            not limited to one cause or one section of society. It means understanding
            people&apos;s needs and taking meaningful steps to support them.
          </p>
        </Reveal>
      </section>

      {/* 4. FIVE INITIATIVES */}
      <section className="mx-auto max-w-[1240px] px-4 pt-14 md:pt-20">
        <Reveal>
          <SectionHeading
            kicker="Our Work"
            title="Where we make a difference"
            lede="Our initiatives focus on various aspects of social welfare."
          />
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90} className={i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}>
              <Link
                href={`/programs/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl bg-white border border-slate-200 hover:shadow-xl transition-shadow focus-visible:outline-2 focus-visible:outline-brand"
              >
                {p.image ? (
                  <span className="block overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </span>
                ) : (
                  <span className="grid h-48 w-full place-items-center bg-brand text-white" role="img" aria-label={`${p.title} icon`}>
                    <ProgramIcon icon={p.icon} size={56} />
                  </span>
                )}
                <span className="flex flex-1 flex-col p-5">
                  <span className="flex items-center gap-2.5">
                    <span className="text-brand" aria-hidden="true"><ProgramIcon icon={p.icon || "hands"} size={26} /></span>
                    <span className="font-sans font-bold text-lg text-ink leading-snug">{p.title}</span>
                  </span>
                  <span className="mt-2 block text-sm text-slate-600 leading-relaxed flex-1">{p.summary}</span>
                  <span className="mt-3 inline-block text-sm font-sans font-bold text-brand transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:transition-none">Read more →</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. SMALL ACTS */}
      <section className="mt-14 md:mt-20 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-[1240px] px-4 py-12 md:py-16 grid gap-8 md:grid-cols-2 md:items-center">
          <Reveal>
            <h2 className="font-serif font-semibold text-ink text-3xl md:text-[2.6rem] leading-[1.12]">
              Small acts. Meaningful change.
            </h2>
            <OrangeStroke animate className="mt-3 h-[14px] w-44" />
            <p className="mt-5 text-ink/75 leading-relaxed">
              We believe that every small act of kindness can create a meaningful difference.
              Whether it is helping a child access education, providing food and clothing to
              someone in need, or working towards a cleaner environment, every initiative is a
              step towards a more caring and inclusive society.
            </p>
            <p className="mt-4 text-ink/75 leading-relaxed">
              Our journey is driven by the belief that change begins when people come together
              with the intention to serve.
            </p>
          </Reveal>
          <Reveal delay={110}>
            <div className="grid grid-cols-2 gap-4">
              {smallActs.map((g) => (
                <figure key={g.id} className="m-0">
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    className="rounded-2xl border border-slate-200 shadow-md w-full aspect-[3/4] object-cover"
                  />
                  <figcaption className="mt-2 text-[13px] text-slate-500 leading-snug">{g.alt}</figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. MISSION */}
      <section className="bg-brand">
        <div className="mx-auto max-w-[1240px] px-4 py-12 md:py-16 text-center">
          <Reveal>
            <p className="font-sans text-[12px] font-bold uppercase tracking-[0.24em] text-accent">Our Mission</p>
            <p className="font-serif mx-auto mt-4 max-w-3xl font-semibold text-white text-2xl md:text-[2.2rem] leading-[1.25]">
              “Our mission is to serve with compassion, empower through education, and
              contribute towards a better society — one step at a time.”
            </p>
            <div aria-hidden className="mx-auto mt-5 flex items-center justify-center gap-2">
              <span className="h-[5px] w-16 rounded-full bg-accent" />
              <span className="h-[5px] w-8 rounded-full bg-white/50" />
              <span className="h-[5px] w-16 rounded-full bg-accent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. CLOSING + IDENTITY NOTE */}
      <section className="mx-auto max-w-[1240px] px-4 py-12 md:py-16 text-center">
        <Reveal>
          <p className="font-sans font-bold text-ink text-xl md:text-2xl">
            {display} — <span className="italic">Learn Today, Lead Tomorrow.</span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/volunteer" className="rounded-md bg-brand px-7 py-3 font-sans text-sm font-bold text-white hover:bg-brand-dark transition">
              Become a Volunteer
            </Link>
            <Link href="/contact" className="rounded-md border border-slate-300 px-7 py-3 font-sans text-sm font-bold text-slate-800 hover:border-slate-500 transition">
              Contact Us
            </Link>
          </div>
          {!legal && (
            <p className="mt-8 text-[13px] text-slate-500 max-w-xl mx-auto">
              Registration details, trustee information and contact details are being confirmed
              with the trust and will be published here once approved.
            </p>
          )}
        </Reveal>
      </section>
    </div>
  );
}
