import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getAllProductSlugs } from "@/sanity/shop-fetch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const lastModified = new Date();

  const staticPaths = ["", "/about", "/shop", "/find-us", "/contact"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: new URL(path || "/", base).href,
    lastModified,
    changeFrequency: path === "" || path === "/shop" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.7,
  }));

  const slugs = await getAllProductSlugs();
  const productEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: new URL(`/shop/${slug}`, base).href,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
