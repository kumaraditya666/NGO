import DonateFlow from "@/components/DonateFlow";
import Reveal from "@/components/Reveal";
import { SectionHeading } from "@/components/ui";
import { getPrograms, getCampaigns } from "@/lib/content";
import { readCollection } from "@/lib/store";
export const metadata = { title: "Donate", robots: { index: false } };
export const dynamic = "force-dynamic";
export default async function Donate() {
  const [programs, campaigns, settings] = await Promise.all([getPrograms(), getCampaigns(), readCollection<any>("settings", {})]);
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <Reveal><SectionHeading kicker="Donate" title="Pay outside, verify inside" lede="First-release model: you pay in your own UPI/bank app, then submit the reference. Staff verify every credit by hand. No cards, no auto-charge, no monthly billing in this release." /></Reveal>
      <DonateFlow programs={programs.filter((p) => p.state === "published")} campaigns={campaigns.filter((c) => c.publish === "published")} settings={settings} />
    </div>
  );
}
