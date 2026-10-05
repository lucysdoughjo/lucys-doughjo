import { getCategoryLeadImage } from "@/lib/category-images";
import {
  buildPurchaseOptions,
  formatPriceLabel,
  type PriceTier,
} from "@/lib/pricing";
import type { ProductImage, ShopProduct } from "@/sanity/shop-types";
import { urlForImage } from "@/sanity/image";

type SanityImage = {
  asset?: unknown;
  alt?: string;
};

function sanityImageToUrl(
  image: SanityImage | undefined,
  width: number,
  height: number,
  fallback: string,
) {
  if (!image?.asset) return fallback;
  return urlForImage(image).width(width).height(height).fit("crop").url();
}

function mapGallery(
  primary: SanityImage | undefined,
  gallery: SanityImage[] | undefined,
  fallbackUrl: string,
  fallbackAlt: string,
): ProductImage[] {
  const images: ProductImage[] = [];

  const primaryUrl = sanityImageToUrl(primary, 1200, 1200, fallbackUrl);
  images.push({
    url: primaryUrl,
    alt: primary?.alt || fallbackAlt,
  });

  if (Array.isArray(gallery)) {
    for (const item of gallery) {
      if (!item?.asset) continue;
      const url = sanityImageToUrl(item, 1200, 1200, fallbackUrl);
      if (images.some((img) => img.url === url)) continue;
      images.push({
        url,
        alt: item.alt || fallbackAlt,
      });
    }
  }

  return images;
}

export function mapSanityProduct(record: {
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
  priceCents?: number;
  unitsPerItem?: number | null;
  unitLabel?: string | null;
  priceTiers?: PriceTier[] | null;
  soldOut?: boolean;
  availableThisWeek?: boolean;
  allergens?: string | null;
  image?: SanityImage;
  gallery?: SanityImage[];
  category?: {
    name?: string;
    slug?: string;
  };
}): ShopProduct | null {
  if (!record.name || !record.slug || !record.description) {
    return null;
  }

  const categorySlug = record.category?.slug ?? "artisan-sourdough";
  const lead = getCategoryLeadImage(categorySlug);
  const gallery = mapGallery(
    record.image,
    record.gallery,
    lead.src,
    record.image?.alt || record.name,
  );

  const priceCents = record.priceCents ?? 0;
  const unitsPerItem = record.unitsPerItem ?? 1;
  const unitLabel = record.unitLabel?.trim() || "each";
  const priceTiers = record.priceTiers ?? [];
  const purchaseOptions = buildPurchaseOptions({
    priceCents,
    unitsPerItem,
    unitLabel,
    priceTiers,
  });

  return {
    id: record._id || record.slug,
    slug: record.slug,
    name: record.name,
    description: record.description,
    priceCents,
    unitsPerItem,
    unitLabel,
    priceTiers,
    purchaseOptions,
    priceLabel: formatPriceLabel({
      priceCents,
      unitsPerItem,
      unitLabel,
      priceTiers,
    }),
    imageUrl: gallery[0]?.url ?? lead.src,
    imageAlt: gallery[0]?.alt ?? record.name,
    gallery,
    categorySlug,
    categoryName: record.category?.name ?? "Menu",
    soldOut: Boolean(record.soldOut),
    availableThisWeek: record.availableThisWeek !== false,
    allergens: record.allergens ?? null,
  };
}
