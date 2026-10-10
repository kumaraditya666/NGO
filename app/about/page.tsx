import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { readCollection } from "@/lib/store";
import { siteConfig } from "@/lib/config";

export const metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function About() {
  const settings = await readCollection<any>("settings", {});
  const display = settings.displayName || settings.ngoName || siteConfig.name;
  const legal = (settings.legalName || "").trim();
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="About"
          title={display}
          lede="A community-rooted nonprofit in India. This profile is being confirmed with the NGO — only approved information appears below."
        />
      </Reveal>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="font-sans font-bold text-xl text-ink">Identity</h2>
            <dl className="mt-3 space-y-2 text-[15px]">
              <div className="flex gap-2"><dt className="text-slate-500 w-32 shrink-0">Public name</dt><dd className="font-semibold text-ink">{display}</dd></div>
              <div className="flex gap-2"><dt className="text-slate-500 w-32 shrink-0">Legal name</dt><dd className="text-slate-600">{legal || "Being confirmed with the trustees."}</dd></div>
              <div className="flex gap-2"><dt className="text-slate-500 w-32 shrink-0">Registration</dt><dd className="text-slate-600">Being confirmed — published here once approved.</dd></div>
              <div className="flex gap-2"><dt className="text-slate-500 w-32 shrink-0">Areas served</dt><dd className="text-slate-600">Being confirmed — published here once approved.</dd></div>
            </dl>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="h-full rounded-xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="font-sans font-bold text-xl text-ink">What we can show today</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-slate-600">
              <li>· Photographs from the team&apos;s work — see the <Link href="/gallery" className="font-bold text-brand underline">gallery</Link>.</li>
              <li>· Programmes, impact figures, team and milestones appear here only after NGO approval.</li>
              <li>· Anything still in draft stays private and is tracked on a staff-only checklist.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/gallery" className="rounded-md bg-brand px-5 py-2.5 text-sm font-sans font-bold text-white hover:bg-brand-dark transition">See the Work</Link>
              <Link href="/contact" className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-sans font-bold text-slate-800 hover:border-slate-500 transition">Contact Us</Link>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <img
          src="/images/gallery/large/616425ff-9736-44ae-a30a-2848ce44878d.jpg"
          alt="Volunteers and children gathered around a Shikshaa Sewa Charitable Trust banner under a tree"
          loading="lazy"
          className="mt-8 rounded-xl w-full aspect-[21/9] object-cover border border-slate-200"
        />
      </Reveal>
    </div>
  );
}
