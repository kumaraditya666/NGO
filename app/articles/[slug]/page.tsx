import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticles } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const all = await getArticles();
  const a = all.find((x) => x.slug === params.slug && x.publish === "published");
  if (!a) return notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 font-sans">
      <Link href="/articles" className="text-sm font-bold text-teal-700 underline">← Articles</Link>
      <p className="mt-3 font-sans text-[12px] font-bold uppercase tracking-widest text-teal-700">{a.category} · {a.date}</p>
      <h1 className="font-sans font-extrabold text-slate-900 text-4xl mt-2">{a.title}</h1>
      <img src={a.image} alt={a.title} className="mt-6 rounded-xl w-full aspect-[16/8] object-cover border border-slate-200" />
      <p className="mt-6 leading-relaxed text-slate-700 whitespace-pre-wrap">{a.body}</p>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <a className="rounded-md border border-slate-300 px-4 py-2 font-sans font-semibold text-slate-700" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(a.title + " " + (process.env.NEXT_PUBLIC_SITE_URL || "") + "/articles/" + a.slug)}`}>Share WhatsApp</a>
        <a className="rounded-md border border-slate-300 px-4 py-2 font-sans font-semibold text-slate-700" target="_blank" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}`}>Share X</a>
      </div>
    </div>
  );
}
