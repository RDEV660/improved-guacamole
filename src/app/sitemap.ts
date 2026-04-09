import type { MetadataRoute } from "next";
import { getSiteCanonicalUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteCanonicalUrl().replace(/\/$/, "");
  const now = new Date();
  return [{ url: base, lastModified: now, changeFrequency: "weekly", priority: 1 }];
}
