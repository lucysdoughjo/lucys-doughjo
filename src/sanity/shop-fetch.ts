import { cache } from "react";
import { getCategoryLeadImage } from "@/lib/category-images";
import {
  getPlaceholderProductBySlug,
  getPlaceholderProductSlugs,
  getPlaceholderShopMenu,
} from "@/lib/shop-catalog";
import { isSanityConfigured } from "./env";
import { urlForImage } from "./image";
import { sanityClient } from "./client";
import { mapSanityProduct } from "./map-product";
import {
  latestWeeklyDropQuery,
  productBySlugQuery,
  productSlugsQuery,
  shopMenuQuery,
} from "./queries";
import type { ShopMenu, ShopProduct } from "./shop-types";

const fetchLatestWeeklyDropNote = cache(async (): Promise<string | null> => {
  if (!isSanityConfigured) return null;
  try {
    const drop = await sanityClient.fetch(latestWeeklyDropQuery);
    return drop?.bakersNote ?? null;
  } catch {
    return null;
  }
});

export const getShopMenu = cache(async (): Promise<ShopMenu> => {
  const bakersNote = await fetchLatestWeeklyDropNote();

  if (!isSanityConfigured) {
    return {
      bakersNote,
      categories: getPlaceholderShopMenu(),
    };
  }

  try {
    const categories = await sanityClient.fetch(shopMenuQuery);

    if (!Array.isArray(categories)) {
      return { bakersNote, categories: getPlaceholderShopMenu() };
    }

    const mapped = categories
      .map(
        (category: {
          _id: string;
          name: string;
          slug: string;
          blurb?: string | null;
          leadImage?: { asset?: unknown; alt?: string };
          products?: unknown[];
        }) => {
          const fallbackLead = getCategoryLeadImage(category.slug);
          const products = (category.products ?? [])
            .map((product) => mapSanityProduct(product as Parameters<typeof mapSanityProduct>[0]))
            .filter((p): p is ShopProduct => p !== null);

          return {
            id: category._id,
            slug: category.slug,
            name: category.name,
            blurb: category.blurb ?? null,
            leadImageUrl: category.leadImage?.asset
              ? urlForImage(category.leadImage)
                  .width(900)
                  .height(600)
                  .fit("crop")
                  .url()
              : fallbackLead.src,
            leadImageAlt:
              category.leadImage?.alt ?? fallbackLead.alt,
            products,
          };
        },
      )
      .filter((c): c is NonNullable<typeof c> => c !== null);

    if (mapped.length === 0) {
      return { bakersNote, categories: getPlaceholderShopMenu() };
    }

    return { bakersNote, categories: mapped };
  } catch {
    return { bakersNote, categories: getPlaceholderShopMenu() };
  }
});

export const getProductBySlug = cache(
  async (slug: string): Promise<ShopProduct | null> => {
    if (!isSanityConfigured) {
      return getPlaceholderProductBySlug(slug);
    }

    try {
      const record = await sanityClient.fetch(productBySlugQuery, { slug });
      if (!record) {
        return null;
      }
      return mapSanityProduct(record);
    } catch {
      return null;
    }
  },
);

export const getAllProductSlugs = cache(async (): Promise<string[]> => {
  if (!isSanityConfigured) {
    return getPlaceholderProductSlugs();
  }

  try {
    const rows = await sanityClient.fetch(productSlugsQuery);
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows
      .map((row: { slug?: string }) => row.slug)
      .filter((slug): slug is string => Boolean(slug));
  } catch {
    return [];
  }
});
