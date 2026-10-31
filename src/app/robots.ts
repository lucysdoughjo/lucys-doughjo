import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio/", "/cart", "/checkout", "/design-system"],
    },
    sitemap: new URL("/sitemap.xml", base).href,
  };
}
