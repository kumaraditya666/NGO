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
    <div className="mx-auto max-w-6xl px-5 py-12">
      <Reveal><SectionHeading kicker="Journal" title="Articles" /></Reveal>
      <form className="mt-6 flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={searchParams.q || ""} placeholder="Search…" className="border rounded-full px-4 py-2 text-sm" />
        <button className="rounded-full bg-forest text-white px-5 py-2 text-sm">Search</button>
        {cats.map((c) => <a key={c} href={`/articles?cat=${encodeURIComponent(c)}`} className="rounded-full border px-4 py-2 text-sm">{c}</a>)}
      </form>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {list.map((a) => <Link key={a.id} href={`/articles/${a.slug}`} className="rounded-2xl border bg-white p-5 block hover:shadow-panel"><p className="text-xs uppercase tracking-widest text-terracotta">{a.category}</p><h2 className="font-editorial text-xl">{a.title}</h2><p className="text-sm text-forest-muted line-clamp-2 mt-1">{a.body}</p></Link>)}
        {list.length === 0 && <p className="text-sm text-forest-muted">No articles found.</p>}
      </div>
    </div>
  );
}
