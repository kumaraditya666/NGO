import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticles } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const all = await getArticles();
  const a = all.find((x) => x.slug === params.slug && x.publish === "published");
  if (!a) return notFound();
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/articles" className="text-sm text-terracotta underline">← Articles</Link>
      <p className="mt-3 text-xs uppercase tracking-widest text-terracotta">{a.category} · {a.date}</p>
      <h1 className="font-editorial text-4xl mt-2">{a.title}</h1>
      <img src={a.image} alt={a.title} className="mt-6 rounded-3xl w-full aspect-[16/8] object-cover border" />
      <p className="mt-6 leading-relaxed whitespace-pre-wrap">{a.body}</p>
      <div className="mt-6 flex gap-2 text-sm">
        <a className="rounded-full border px-4 py-2" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(a.title + " " + (process.env.NEXT_PUBLIC_SITE_URL || "") + "/articles/" + a.slug)}`}>Share WhatsApp</a>
        <a className="rounded-full border px-4 py-2" target="_blank" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}`}>Share X</a>
      </div>
    </div>
  );
}
