export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Shikshaa Sewa Charitable Trust",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Shikshaa Sewa",
  tagline: "Learn today, lead tomorrow",
  description:
    "Shikshaa Sewa Charitable Trust — a community-rooted nonprofit in India. Volunteer, pledge supplies, or get in touch.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  instagram: "https://www.instagram.com/shikshaasewa_charitabletrust/",
  location: process.env.NEXT_PUBLIC_LOCATION || "India",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.org",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91-00000-00000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "910000000000",
  address: "[CONTACT DETAILS — sample address, replace before launch]",
  hours: "Mon–Sat, 10:00–18:00 IST",
};

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE !== "false" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY);

export const emailConfigured = Boolean(
  (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) ||
  (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
);
