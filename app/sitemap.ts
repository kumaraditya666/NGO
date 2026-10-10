import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages = ["", "/about", "/programs", "/gallery", "/volunteer", "/in-kind", "/corporate", "/contact", "/faq", "/privacy", "/terms", "/donation-policy", "/support", "/transparency", "/donate"];
  return pages.map((p) => ({ url: `${base}${p || "/"}`, lastModified: new Date() }));
}
