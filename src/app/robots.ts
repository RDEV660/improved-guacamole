import type { MetadataRoute } from "next";
import { getSiteCanonicalUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteCanonicalUrl().replace(/\/$/, "");
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: "/admin" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
