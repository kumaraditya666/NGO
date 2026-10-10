import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getArticles } from "@/lib/content";
export const metadata = { title: "Articles" };
export const dynamic = "force-dynamic";
export default async function Articles({ searchParams }: { searchParams: { q?: string; cat?: string } }) {
  const all = (await getArticles()).filter((a) => a.publish === "published");
  const q = (searchParams.q || "").toLowerCase();
  const cat = searchParams.cat || "";
  const list = all.filter((a) => (!cat || a.category === cat) && (!q || (a.title + a.body).toLowerCase().includes(q)));
  const cats = Array.from(new Set(all.map((a) => a.category)));
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 font-sans">
      <Reveal><SectionHeading kicker="Journal" title="Articles" lede="Explainers and notes from the team — published only after approval." /></Reveal>
      {all.length === 0 ? (
        <p className="mt-6 rounded-xl border border-slate-200 bg-cream p-6 text-slate-600">
          No articles published yet. <Link href="/gallery" className="font-bold text-brand underline">Browse the gallery</Link> meanwhile.
        </p>
      ) : (
        <>
          <form className="mt-6 flex flex-wrap gap-2" method="get">
            <input name="q" defaultValue={searchParams.q || ""} placeholder="Search…" aria-label="Search articles" className="border border-slate-300 rounded-md px-4 py-2 text-sm font-sans" />
            <button className="rounded-md bg-brand text-white px-5 py-2 text-sm font-sans font-bold hover:bg-brand-dark transition">Search</button>
            {cats.map((c) => <a key={c} href={`/articles?cat=${encodeURIComponent(c)}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-sans text-slate-700">{c}</a>)}
          </form>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {list.map((a) => (
              <Link key={a.id} href={`/articles/${a.slug}`} className="rounded-xl border border-slate-200 bg-white p-5 block hover:shadow-lg transition">
                <p className="font-sans text-[12px] font-bold uppercase tracking-widest text-brand">{a.category}</p>
                <h2 className="font-sans font-bold text-xl text-ink">{a.title}</h2>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1">{a.body}</p>
              </Link>
            ))}
            {list.length === 0 && <p className="text-sm text-slate-600">No articles found.</p>}
          </div>
        </>
      )}
    </div>
  );
}
