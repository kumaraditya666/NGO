import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getStories, getArticles, getTestimonials } from "@/lib/content";
export const metadata = { title: "Impact & stories" };
export const dynamic = "force-dynamic";
export default async function Impact({ searchParams }: { searchParams: { cat?: string } }) {
  const [stories, articles, testimonials] = await Promise.all([getStories(), getArticles(), getTestimonials()]);
  const cat = searchParams.cat || "";
  const filt = (s: any) => !cat || s.category === cat;
  const cats = Array.from(new Set([...stories, ...articles].map((s) => s.category)));
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><SectionHeading kicker="Impact" title="Measured, dated, and honest" lede="Reporting period: FY 2025–26 (sample). Metrics below are placeholders — staff must replace with verified figures before launch." /></Reveal>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[["320+", "learning sessions (sample)"], ["6", "health camps (sample)"], ["1,200", "saplings (sample)"], ["100%", "donations manually verified"]].map(([a, b]) => (
          <div key={b} className="rounded-2xl border bg-white p-4"><p className="font-editorial text-2xl">{a}</p><p className="text-xs text-forest-muted">{b}</p></div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <a href="/impact" className={`rounded-full border px-4 py-1.5 text-sm ${!cat ? "bg-forest text-white" : ""}`}>All</a>
        {cats.map((c) => <a key={c} href={`/impact?cat=${encodeURIComponent(c)}`} className={`rounded-full border px-4 py-1.5 text-sm ${cat === c ? "bg-forest text-white" : ""}`}>{c}</a>)}
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {[...stories, ...articles].filter(filt).map((s) => (
          <article key={s.id} className="rounded-3xl border bg-white overflow-hidden"><img src={s.image} alt={s.title} className="aspect-[16/8] object-cover w-full" loading="lazy" /><div className="p-5"><p className="text-xs uppercase tracking-widest text-terracotta">{s.category} · {s.date}</p><h2 className="font-editorial text-xl mt-1">{s.title}</h2><p className="text-sm text-forest-muted mt-2">{s.body}</p></div></article>
        ))}
      </div>
      <h2 className="font-editorial text-2xl mt-10">Testimonials</h2>
      <div className="mt-4 grid md:grid-cols-2 gap-4">{testimonials.filter((t) => t.approved).map((t) => <figure key={t.id} className="rounded-2xl border bg-parchment p-5"><blockquote>“{t.quote}”</blockquote><figcaption className="text-sm text-forest-muted mt-2">{t.name} — {t.role}</figcaption></figure>)}</div>
      <div className="mt-8 rounded-2xl border p-6"><h2 className="font-editorial text-xl">Downloadable reports</h2><p className="text-sm text-forest-muted">Upload verified PDFs in Admin → Reports. None published yet (sample state).</p></div>
    </div>
  );
}
