import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProgramIcon from "@/components/ProgramIcon";
import { SectionHeading } from "@/components/ui";
import { getPrograms } from "@/lib/content";
export const metadata = { title: "Our Work" };
export const dynamic = "force-dynamic";
export default async function Programs() {
  const programs = (await getPrograms()).filter((p) => p.state === "published");
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Our Work"
          title="Programmes"
          lede="Only NGO-approved programmes appear here. Each one lists the need addressed, activities, location and ways to take part."
        />
      </Reveal>
      {programs.length === 0 ? (
        <Reveal>
          <div className="mt-8 rounded-xl border border-slate-200 bg-cream p-8 text-center">
            <p className="font-sans font-bold text-lg text-ink">Programme details are being confirmed</p>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              The NGO has not approved programme write-ups yet. Meanwhile, photographs from
              the field are already public in the gallery.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/gallery" className="rounded-md bg-brand px-5 py-2.5 text-sm font-sans font-bold text-white hover:bg-brand-dark transition">Open Gallery</Link>
              <Link href="/contact" className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-sans font-bold text-slate-800 hover:border-slate-500 transition">Ask Us Anything</Link>
            </div>
          </div>
        </Reveal>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {programs.map((p) => (
            <Link key={p.id} href={`/programs/${p.slug}`} className="rounded-xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition block">
              {p.image ? (
                <img src={p.image} alt={p.title} className="aspect-[16/10] object-cover w-full" loading="lazy" />
              ) : (
                <span className="aspect-[16/10] w-full grid place-items-center bg-brand text-white" role="img" aria-label={`${p.title} icon`}>
                  <ProgramIcon icon={p.icon} size={56} />
                </span>
              )}
              <div className="p-5">
                <h2 className="font-sans font-bold text-xl text-ink">{p.title}</h2>
                <p className="text-sm text-slate-600 mt-2">{p.summary}</p>
                <p className="mt-3 text-sm font-sans font-bold text-brand">Explore →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
