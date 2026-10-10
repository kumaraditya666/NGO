import { readCollection } from "./store";
import type {
  Program, Campaign, CampaignUpdate, Donation, NgoEvent, Story, GalleryItem,
  Testimonial, TeamMember, Settings, VolunteerOpportunity, VideoItem,
} from "./types";

export async function getSettings(): Promise<Settings> {
  return readCollection<Settings>("settings", {} as Settings);
}
export async function getPrograms(): Promise<Program[]> {
  return readCollection<Program[]>("programs", []);
}
export async function getCampaigns(): Promise<Campaign[]> {
  return readCollection<Campaign[]>("campaigns", []);
}
export async function getDonations(): Promise<Donation[]> {
  return readCollection<Donation[]>("donations", []);
}
export async function getEvents(): Promise<NgoEvent[]> {
  return readCollection<NgoEvent[]>("events", []);
}
export async function getStories(): Promise<Story[]> {
  return readCollection<Story[]>("stories", []);
}
export async function getArticles(): Promise<Story[]> {
  return readCollection<Story[]>("articles", []);
}
export async function getGallery(): Promise<GalleryItem[]> {
  const all = await readCollection<GalleryItem[]>("gallery", []);
  return all
    .filter((g) => g.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id));
}

export async function getVideos(): Promise<VideoItem[]> {
  const all = await readCollection<VideoItem[]>("videos", []);
  return all
    .filter((v) => v.published === true)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id));
}
export async function getTestimonials(): Promise<Testimonial[]> {
  return readCollection<Testimonial[]>("testimonials", []);
}
export async function getTeam(): Promise<TeamMember[]> {
  return readCollection<TeamMember[]>("team", []);
}
export async function getOpportunities(): Promise<VolunteerOpportunity[]> {
  return readCollection<VolunteerOpportunity[]>("opportunities", []);
}
export async function getUpdates(): Promise<CampaignUpdate[]> {
  return readCollection<CampaignUpdate[]>("campaign_updates", []);
}

export function campaignRaised(campaign: Campaign, donations: Donation[]) {
  const online = donations
    .filter((d) => d.status === "confirmed" && !d.testRecord && d.fundType === "campaign" && d.fundId === campaign.id)
    .reduce((s, d) => s + (d.verifiedAmount ?? d.amount), 0);
  const offline = campaign.offlineConfirmed || 0;
  return { online, offline, total: online + offline };
}
