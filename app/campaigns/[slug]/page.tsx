import { notFound } from "next/navigation";
import CampaignDetail from "@/components/CampaignDetail";
import { getCampaigns, getDonations, getUpdates, campaignRaised } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: { slug: string } }) {
  const campaigns = await getCampaigns();
  const c = campaigns.find((x) => x.slug === params.slug && x.publish === "published");
  if (!c) return notFound();
  const [donations, updates] = await Promise.all([getDonations(), getUpdates()]);
  const raised = campaignRaised(c, donations);
  const cu = updates.filter((u) => u.campaignId === c.id);
  return <CampaignDetail campaign={c} updates={cu} raised={raised} />;
}
