import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { readCollection } from "@/lib/store";
export const metadata = { title: "FAQ" };
export const dynamic = "force-dynamic";
export default async function Faq() {
  const faqs = await readCollection<any[]>("faqs", []);
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Reveal><SectionHeading kicker="Help" title="Questions, answered plainly" /></Reveal>
      <div className="mt-6 space-y-3">{faqs.map((f: any) => <details key={f.id} className="rounded-2xl border bg-white p-5"><summary className="font-semibold cursor-pointer">{f.q}</summary><p className="text-sm text-forest-muted mt-2">{f.a}</p></details>)}</div>
    </div>
  );
}
