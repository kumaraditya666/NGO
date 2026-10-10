export type PublishState = "draft" | "published" | "archived";

export interface Program {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  location: string;
  challenge: string;
  activities: string[];
  goals: string[];
  outcomes: string;
  image: string;
  state: PublishState;
  order: number;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  summary: string;
  purpose: string;
  budget: { label: string; amount: number }[];
  goalAmount: number;
  offlineConfirmed: number;
  deadline: string;
  programId?: string;
  state: "active" | "completed" | "archived";
  publish: PublishState;
  image: string;
  createdAt: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  date: string;
  title: string;
  body: string;
  image?: string;
}

export type DonationStatus =
  | "awaiting_payment"
  | "submitted_for_verification"
  | "confirmed"
  | "rejected"
  | "cancelled";

export interface Donation {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone?: string;
  fundType: "general" | "program" | "campaign";
  fundId?: string;
  amount: number;
  message?: string;
  anonymous: boolean;
  status: DonationStatus;
  utr?: string;
  paidAt?: string;
  proofFile?: string;
  cannotFindRef?: boolean;
  verifiedAmount?: number;
  ackNumber?: string;
  reviewer?: string;
  reviewedAt?: string;
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonationEvent {
  id: string;
  donationId: string;
  from: DonationStatus | "created";
  to: DonationStatus;
  by: string;
  note?: string;
  at: string;
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  location: string;
  commitment: string;
  description: string;
  programId?: string;
  eventId?: string;
  open: boolean;
}

export interface VolunteerApp {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  skills?: string;
  interests?: string;
  availability?: string;
  programId?: string;
  eventId?: string;
  message?: string;
  status: "new" | "reviewing" | "accepted" | "declined";
  createdAt: string;
}

export interface NgoEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  mapUrl: string;
  capacity: number;
  registered: number;
  image: string;
  state: "upcoming" | "past";
  publish: PublishState;
}

export interface EventReg {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  seats: number;
  createdAt: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  category: string;
  programId?: string;
  body: string;
  image: string;
  date: string;
  publish: PublishState;
}

export interface Article extends Story {}
export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  caption: string;
  alt: string;
  /** Relative source file under public/images/gallery (managed by scripts/sync-gallery.ps1). */
  file?: string;
  /** Optimised grid thumbnail (EXIF-free). Falls back to image. */
  thumb?: string;
  /** Natural dimensions — used to reserve layout space (no layout shift). */
  width?: number;
  height?: number;
  /** Display order — lower first. Reorder in Admin → Content → gallery. */
  order?: number;
  /** Unpublished photos stay private. Undefined counts as published. */
  published?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  /** Uploaded cover image path (do not hotlink platform thumbnails). */
  cover: string;
  coverAlt: string;
  /** Exact video/reel URL (https only). */
  url: string;
  platform: "instagram" | "youtube" | "other";
  order?: number;
  /** Only published items appear publicly. */
  published?: boolean;
}
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  approved: boolean;
}
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  trustee: boolean;
}
export interface ReportDoc {
  id: string;
  title: string;
  year: string;
  kind: string;
  url: string;
}
export interface Enquiry {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "new" | "done";
  createdAt: string;
}
export interface Settings {
  ngoName: string;
  /** Public display name (working title until the client confirms). */
  displayName: string;
  /** Registered legal name. Empty until the client confirms it. */
  legalName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  address: string;
  hours: string;
  mapUrl: string;
  upiId: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  qrImage: string;
  pickupEnabled: boolean;
  /** Master switch for online donations. Enforced server-side. */
  donationsEnabled: boolean;
  totalsNote: string;
}
