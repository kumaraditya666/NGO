import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getStories, getArticles, getTestimonials } from "@/lib/content";
import { readCollection } from "@/lib/store";
export const metadata = { title: "Impact" };
export const dynamic = "force-dynamic";
export default async function Impact({ searchParams }: { searchParams: { cat?: string } }) {
  const [stories, articles, testimonials, reports] = await Promise.all([
    getStories(), getArticles(), getTestimonials(), readCollection<any[]>("reports", []),
  ]);
  const pub = [...stories.filter((s) => s.publish === "published"), ...articles.filter((a) => a.publish === "published")];
  const cat = searchParams.cat || "";
  const filt = (s: any) => !cat || s.category === cat;
  const cats = Array.from(new Set(pub.map((s) => s.category)));
  const voices = testimonials.filter((t) => t.approved);
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Impact"
          title="What changed, verified"
          lede="Figures, stories and reports appear here only after the NGO verifies and approves them — with the reporting period and what each figure measures stated plainly."
        />
      </Reveal>
      {pub.length === 0 && voices.length === 0 && reports.length === 0 ? (
        <Reveal>
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="font-sans font-bold text-lg text-slate-900">Impact reporting is being compiled</p>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              Verified figures and approved activity stories will be published here. Meanwhile,
              photographs from the field are already public.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/gallery" className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-sans font-bold text-white hover:bg-teal-800 transition">Open Gallery</Link>
              <Link href="/transparency" className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-sans font-bold text-slate-800 hover:border-slate-500 transition">How Support Is Used</Link>
            </div>
          </div>
        </Reveal>
      ) : (
        <>
          {cats.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <a href="/impact" className={`rounded-full border px-4 py-1.5 text-sm font-sans ${!cat ? "bg-teal-700 text-white border-teal-700" : "border-slate-300 text-slate-700"}`}>All</a>
              {cats.map((c) => <a key={c} href={`/impact?cat=${encodeURIComponent(c)}`} className={`rounded-full border px-4 py-1.5 text-sm font-sans ${cat === c ? "bg-teal-700 text-white border-teal-700" : "border-slate-300 text-slate-700"}`}>{c}</a>)}
            </div>
          )}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {pub.filter(filt).map((s) => (
              <article key={s.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <img src={s.image} alt={s.title} className="aspect-[16/8] object-cover w-full" loading="lazy" />
                <div className="p-5">
                  <p className="font-sans text-[12px] font-bold uppercase tracking-widest text-teal-700">{s.category} · {s.date}</p>
                  <h2 className="font-sans font-bold text-xl mt-1 text-slate-900">{s.title}</h2>
                  <p className="text-sm text-slate-600 mt-2">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
          {voices.length > 0 && (
            <>
              <h2 className="font-sans font-bold text-2xl mt-10 text-slate-900">Testimonials</h2>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                {voices.map((t) => (
                  <figure key={t.id} className="rounded-xl border border-slate-200 bg-white p-5">
                    <blockquote className="text-slate-800">“{t.quote}”</blockquote>
                    <figcaption className="text-sm text-slate-500 mt-2">{t.name} — {t.role}</figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
          {reports.length > 0 && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-sans font-bold text-xl text-slate-900">Reports</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {reports.map((r: any) => <li key={r.id}><a className="underline text-teal-700" href={r.url}>{r.title} ({r.year})</a></li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
