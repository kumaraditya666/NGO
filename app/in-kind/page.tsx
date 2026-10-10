import PledgeForm from "@/components/PledgeForm";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { readCollection } from "@/lib/store";
export const metadata = { title: "In-kind donations" };
export const dynamic = "force-dynamic";
export default async function InKind() {
  const items = await readCollection<any[]>("inkind_items", []);
  const settings = await readCollection<any>("settings", { pickupEnabled: false } as any);
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Reveal><SectionHeading kicker="In-kind" title="Give goods, not guesswork" lede="Drop-off only unless staff enable pickup. Only pledge what is listed." /></Reveal>
      <div className="mt-6 rounded-3xl border bg-white p-6">
        <h2 className="font-editorial text-xl">Needed now (sample)</h2>
        <ul className="mt-3 space-y-2 text-sm">{items.map((i: any) => <li key={i.id} className="flex justify-between border-b py-2"><span><strong>{i.label}</strong> — {i.guidelines}</span><span>{i.needed} {i.unit}</span></li>)}</ul>
        <div className="mt-4 text-sm bg-parchment rounded-2xl p-4"><strong>Condition & drop-off (sample):</strong> clean, working condition only. Drop: Community Hall, [LOCATION], Sat 10–12. {settings.pickupEnabled ? "Pickup is enabled — mention your area." : "Pickup is currently NOT offered."}</div>
      </div>
      <div className="mt-6"><PledgeForm items={items} pickup={settings.pickupEnabled} /></div>
    </div>
  );
}
