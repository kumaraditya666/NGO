import PledgeForm from "@/components/PledgeForm";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { readCollection } from "@/lib/store";
export const metadata = { title: "Give Supplies" };
export const dynamic = "force-dynamic";
export default async function InKind() {
  const items = await readCollection<any[]>("inkind_items", []);
  const settings = await readCollection<any>("settings", { pickupEnabled: false } as any);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 font-sans">
      <Reveal>
        <SectionHeading
          kicker="Give Supplies"
          title="Offer what the team needs"
          lede="Only goods the team can genuinely use. Every pledge goes to staff for review before anything moves."
        />
      </Reveal>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-sans font-bold text-xl text-ink">Needed right now</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-[15px] text-slate-600">
            The needs list is being confirmed with the team. You can still offer goods below —
            describe the item and its condition, and staff will confirm whether it helps.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {items.map((i: any) => (
              <li key={i.id} className="flex justify-between gap-3 border-b border-slate-100 py-2">
                <span><strong>{i.label}</strong>{i.guidelines ? ` — ${i.guidelines}` : ""}</span>
                <span className="shrink-0">{i.needed} {i.unit}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 text-sm bg-cream border border-slate-200 rounded-xl p-4 text-slate-600">
          {settings.pickupEnabled
            ? "Pickup is offered in some areas — mention yours in the pledge and staff will confirm."
            : "Drop-off only for now — staff will share the drop point when they confirm your pledge."}
        </div>
      </div>
      <div className="mt-6"><PledgeForm pickup={settings.pickupEnabled === true} /></div>
    </div>
  );
}
