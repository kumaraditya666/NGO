import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getPrograms } from "@/lib/content";
export const metadata = { title: "Programs" };
export const dynamic = "force-dynamic";
export default async function Programs() {
  const programs = (await getPrograms()).filter((p) => p.state === "published");
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><SectionHeading kicker="Programs" title="Three places to begin" lede="Sample descriptions — each program page shows challenge, activities, goals, outcomes, gallery and related campaigns." /></Reveal>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {programs.map((p) => (
          <Link key={p.id} href={`/programs/${p.slug}`} className="rounded-3xl overflow-hidden border border-forest/10 bg-white hover:shadow-panel transition block">
            <img src={p.image} alt={p.title} className="aspect-[16/10] object-cover w-full" loading="lazy" />
            <div className="p-5"><h2 className="font-editorial text-xl">{p.title}</h2><p className="text-sm text-forest-muted mt-2">{p.summary}</p><p className="mt-2 text-sm font-semibold text-terracotta">{p.location} →</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
