import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const pages = ["", "/about", "/programs", "/campaigns", "/impact", "/gallery", "/events", "/volunteer", "/corporate", "/in-kind", "/transparency", "/articles", "/contact", "/faq", "/donate"];
  return pages.map((p) => ({ url: `${base}${p || "/"}`, lastModified: new Date() }));
}
