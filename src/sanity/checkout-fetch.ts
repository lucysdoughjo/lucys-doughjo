import { cache } from "react";
import { getPlaceholderProductBySlug } from "@/lib/shop-catalog";
import { isSanityConfigured } from "./env";
import { mapCheckoutProduct } from "./map-checkout-product";
import {
  latestWeeklyDropQuery,
  productsBySlugsQuery,
  siteSettingsQuery,
} from "./queries";
import { sanityWriteClient, isSanityWriteConfigured } from "./write-client";
import type { CheckoutProduct } from "./shop-types";

export type SiteFulfillmentSettings = {
  contactEmail: string | null;
  pickupAddress: string | null;
  pickupInstructions: string | null;
  deliveryZipCodes: string[];
  deliveryFeeCents: number;
  deliveryNotes: string | null;
};

const defaultFulfillment: SiteFulfillmentSettings = {
  contactEmail: "hello@lucysdoughjo.com",
  pickupAddress: "Chino, CA — pickup details TBD",
  pickupInstructions: "Sunday Dough Drop pickup instructions will go here.",
  deliveryZipCodes: ["91708", "91710", "91709"],
  deliveryFeeCents: 500,
  deliveryNotes: "Local delivery on Sundays within listed ZIP codes.",
};

export async function getCheckoutProductsBySlugs(
  slugs: string[],
): Promise<Map<string, CheckoutProduct>> {
  const unique = [...new Set(slugs.filter(Boolean))];
  const bySlug = new Map<string, CheckoutProduct>();

  if (unique.length === 0) {
    return bySlug;
  }

  if (!isSanityConfigured) {
    for (const slug of unique) {
      const product = getPlaceholderProductBySlug(slug);
      if (product) {
        bySlug.set(slug, {
          ...product,
          revision: null,
          unitsSoldThisWeek: 0,
          unitsReservedThisWeek: 0,
        });
      }
    }
    return bySlug;
  }

  const client = isSanityWriteConfigured() ? sanityWriteClient : null;
  if (!client) {
    return bySlug;
  }

  const records = await client.fetch(productsBySlugsQuery, { slugs: unique });
  if (!Array.isArray(records)) {
    return bySlug;
  }

  for (const record of records) {
    const product = mapCheckoutProduct(record);
    if (product) {
      bySlug.set(product.slug, product);
    }
  }

  return bySlug;
}

export const getSiteFulfillmentSettings = cache(
  async (): Promise<SiteFulfillmentSettings> => {
    if (!isSanityWriteConfigured()) {
      return defaultFulfillment;
    }

    try {
      const settings = await sanityWriteClient.fetch(siteSettingsQuery);
      return {
        contactEmail:
          settings?.contactEmail?.trim() || defaultFulfillment.contactEmail,
        pickupAddress:
          settings?.pickupAddress?.trim() || defaultFulfillment.pickupAddress,
        pickupInstructions:
          settings?.pickupInstructions?.trim() ||
          defaultFulfillment.pickupInstructions,
        deliveryZipCodes: Array.isArray(settings?.deliveryZipCodes)
          ? settings.deliveryZipCodes
              .map((zip: string) => zip?.trim())
              .filter(Boolean)
          : defaultFulfillment.deliveryZipCodes,
        deliveryFeeCents:
          typeof settings?.deliveryFeeCents === "number"
            ? Math.max(0, settings.deliveryFeeCents)
            : defaultFulfillment.deliveryFeeCents,
        deliveryNotes:
          settings?.deliveryNotes?.trim() || defaultFulfillment.deliveryNotes,
      };
    } catch {
      return defaultFulfillment;
    }
  },
);

export async function getCurrentDropWeekStart(): Promise<string | null> {
  if (!isSanityWriteConfigured()) {
    return null;
  }

  try {
    const drop = await sanityWriteClient.fetch(latestWeeklyDropQuery);
    return drop?.weekStart ?? null;
  } catch {
    return null;
  }
}
