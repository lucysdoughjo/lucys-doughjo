import { getCategoryLeadImage } from "@/lib/category-images";
import {
  buildPurchaseOptions,
  formatPriceLabel,
  type PriceTier,
} from "@/lib/pricing";
import type { ShopCategory, ShopProduct } from "@/sanity/shop-types";

type RawProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  unitsPerItem?: number;
  unitLabel?: string;
  priceTiers?: PriceTier[];
  imageUrl: string;
  imageAlt: string;
  gallery: ShopProduct["gallery"];
  categorySlug: string;
  categoryName: string;
  soldOut: boolean;
  availableThisWeek: boolean;
  allergens: string | null;
};

function enrichProduct(raw: RawProduct): ShopProduct {
  const unitsPerItem = raw.unitsPerItem ?? 1;
  const unitLabel = raw.unitLabel ?? "each";
  const priceTiers = raw.priceTiers ?? [];

  return {
    ...raw,
    unitsPerItem,
    unitLabel,
    priceTiers,
    purchaseOptions: buildPurchaseOptions({
      priceCents: raw.priceCents,
      unitsPerItem,
      unitLabel,
      priceTiers,
    }),
    priceLabel: formatPriceLabel({
      priceCents: raw.priceCents,
      unitsPerItem,
      unitLabel,
      priceTiers,
    }),
  };
}

const loafPrimary = "/assets/artisan_sourdough/artisan-sourdough-primary.jpg";
const loafSecondary = "/assets/artisan_sourdough/artisan-sourdough-secondary.jpg";
const loafInclusion = "/assets/artisan_sourdough/artisan-loaf-dark-inclusion.jpg";
const loafCrumb = "/assets/artisan_sourdough/artisan-loaf-crumb-detail.jpg";
const bagelsPrimary = "/assets/Bagels/bagels-assorted-primary.jpg";
const bagelsSecondary = "/assets/Bagels/bagels-assorted-secondary.jpg";

const rawProducts: RawProduct[] = [
  {
    id: "product-original-sourdough",
    slug: "original-sourdough",
    name: "Original Sourdough",
    description: "Classic hand-shaped loaf with a golden crust.",
    priceCents: 1400,
    imageUrl: loafPrimary,
    imageAlt: "Round artisan sourdough loaf",
    gallery: [
      { url: loafPrimary, alt: "Round artisan sourdough loaf" },
      { url: loafSecondary, alt: "Artisan sourdough loaf alternate angle" },
    ],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat.",
  },
  {
    id: "product-jalapeno-cheddar",
    slug: "jalapeno-cheddar",
    name: "Jalapeño Cheddar",
    description: "Naturally leavened sourdough with a savory kick.",
    priceCents: 1600,
    imageUrl: loafInclusion,
    imageAlt: "Sliced sourdough loaf with visible inclusions",
    gallery: [
      { url: loafInclusion, alt: "Sliced sourdough loaf with visible inclusions" },
      { url: loafCrumb, alt: "Crumb detail of sourdough slice" },
    ],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk.",
  },
  {
    id: "product-sun-dried-tomato-garlic",
    slug: "sun-dried-tomato-garlic",
    name: "Sun-Dried Tomato & Garlic",
    description: "Savory loaf with sun-dried tomato and roasted garlic.",
    priceCents: 1600,
    imageUrl: loafInclusion,
    imageAlt: "Artisan loaf with savory inclusions",
    gallery: [{ url: loafInclusion, alt: "Artisan loaf with savory inclusions" }],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat.",
  },
  {
    id: "product-double-chocolate",
    slug: "double-chocolate",
    name: "Double Chocolate",
    description: "Rich chocolate sourdough for something a little sweet.",
    priceCents: 1600,
    imageUrl: loafInclusion,
    imageAlt: "Dark inclusion artisan loaf",
    gallery: [{ url: loafInclusion, alt: "Dark inclusion artisan loaf" }],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk, egg.",
  },
  {
    id: "product-croissant-loaf",
    slug: "croissant-loaf",
    name: "Croissant Loaf",
    description: "Buttery layers in a shareable loaf.",
    priceCents: 1600,
    imageUrl: loafPrimary,
    imageAlt: "Golden artisan loaf",
    gallery: [{ url: loafPrimary, alt: "Golden artisan loaf" }],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk, egg.",
  },
  {
    id: "product-rosemary-garlic",
    slug: "rosemary-garlic",
    name: "Rosemary Garlic",
    description: "Fragrant rosemary and garlic throughout the crumb.",
    priceCents: 1600,
    imageUrl: loafPrimary,
    imageAlt: "Scored artisan sourdough loaf",
    gallery: [{ url: loafPrimary, alt: "Scored artisan sourdough loaf" }],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat.",
  },
  {
    id: "product-chili-crunch-cheddar-chive",
    slug: "chili-crunch-cheddar-chive",
    name: "Chili Crunch, Cheddar & Chive",
    description: "Bold heat, cheddar, and fresh chive in every slice.",
    priceCents: 1600,
    imageUrl: loafInclusion,
    imageAlt: "Savory artisan loaf",
    gallery: [{ url: loafInclusion, alt: "Savory artisan loaf" }],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk.",
  },
  {
    id: "product-cinnamon-raisin",
    slug: "cinnamon-raisin",
    name: "Cinnamon Raisin",
    description: "Warm cinnamon and plump raisins in a tender loaf.",
    priceCents: 1600,
    imageUrl: loafPrimary,
    imageAlt: "Artisan loaf",
    gallery: [{ url: loafPrimary, alt: "Artisan loaf" }],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat.",
  },
  {
    id: "product-bagels-original",
    slug: "bagels-original",
    name: "Original Bagels",
    description: "Small-batch bagels — sold as a 4-pack.",
    priceCents: 1000,
    unitsPerItem: 4,
    unitLabel: "4-pack",
    imageUrl: bagelsPrimary,
    imageAlt: "Assorted bagels",
    gallery: [{ url: bagelsPrimary, alt: "Assorted bagels" }],
    categorySlug: "bagels",
    categoryName: "Bagels",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat.",
  },
  {
    id: "product-bagels-jalapeno",
    slug: "bagels-jalapeno-cheddar",
    name: "Jalapeño Cheddar Bagels",
    description: "Savory bagels with cheese and jalapeño — sold as a 4-pack.",
    priceCents: 1200,
    unitsPerItem: 4,
    unitLabel: "4-pack",
    imageUrl: bagelsSecondary,
    imageAlt: "Assorted bagels",
    gallery: [{ url: bagelsSecondary, alt: "Assorted bagels" }],
    categorySlug: "bagels",
    categoryName: "Bagels",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk.",
  },
  {
    id: "product-bagels-chili-crunch",
    slug: "bagels-chili-crunch",
    name: "Chili Crunch Bagels",
    description: "Bold flavor with a touch of heat — sold as a 4-pack.",
    priceCents: 1200,
    unitsPerItem: 4,
    unitLabel: "4-pack",
    imageUrl: bagelsPrimary,
    imageAlt: "Assorted bagels",
    gallery: [{ url: bagelsPrimary, alt: "Assorted bagels" }],
    categorySlug: "bagels",
    categoryName: "Bagels",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat.",
  },
  {
    id: "product-english-muffins",
    slug: "english-muffins",
    name: "English Muffins",
    description: "Soft and chewy with a crisp edge — sold as a 4-pack.",
    priceCents: 1000,
    unitsPerItem: 4,
    unitLabel: "4-pack",
    imageUrl: "/assets/english_muffins/english-muffins-primary.jpg",
    imageAlt: "English muffins",
    gallery: [
      {
        url: "/assets/english_muffins/english-muffins-primary.jpg",
        alt: "English muffins",
      },
    ],
    categorySlug: "english-muffins",
    categoryName: "English Muffins",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat.",
  },
  {
    id: "product-cinnamon-rolls",
    slug: "cinnamon-rolls",
    name: "Cinnamon Rolls",
    description: "Soft, glazed rolls baked for Sunday morning.",
    priceCents: 700,
    priceTiers: [{ quantity: 4, priceCents: 2500, label: "4 for $25" }],
    imageUrl: "/assets/cinnamon_rolls/cinnamon-rolls-glazed-primary.jpg",
    imageAlt: "Glazed cinnamon rolls",
    gallery: [
      {
        url: "/assets/cinnamon_rolls/cinnamon-rolls-glazed-primary.jpg",
        alt: "Glazed cinnamon rolls",
      },
      {
        url: "/assets/cinnamon_rolls/cinnamon-rolls-fresh-baked.jpg",
        alt: "Fresh baked cinnamon rolls",
      },
    ],
    categorySlug: "cinnamon-rolls",
    categoryName: "Cinnamon Rolls",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk, egg.",
  },
  {
    id: "product-blueberry-scones",
    slug: "blueberry-scones",
    name: "Blueberry Scones",
    description: "Buttery scones with visible blueberry pockets.",
    priceCents: 400,
    priceTiers: [{ quantity: 3, priceCents: 1000, label: "3 for $10" }],
    imageUrl: "/assets/scones/blueberry-scone-primary.jpg",
    imageAlt: "Blueberry scone close-up",
    gallery: [
      {
        url: "/assets/scones/blueberry-scone-primary.jpg",
        alt: "Blueberry scone close-up",
      },
      {
        url: "/assets/scones/blueberry-scone-secondary.jpg",
        alt: "Blueberry scone alternate view",
      },
    ],
    categorySlug: "scones",
    categoryName: "Scones",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk, egg.",
  },
  {
    id: "product-jumbo-cookie",
    slug: "jumbo-chocolate-chip",
    name: "Jumbo Chocolate Chip Cookie",
    description: "Large bakery-style cookie with a soft center.",
    priceCents: 300,
    priceTiers: [{ quantity: 2, priceCents: 500, label: "2 for $5" }],
    imageUrl: "/assets/jumbo_cookies/jumbo-cookies-primary.jpg",
    imageAlt: "Jumbo cookies",
    gallery: [
      {
        url: "/assets/jumbo_cookies/jumbo-cookies-primary.jpg",
        alt: "Jumbo cookies",
      },
      {
        url: "/assets/jumbo_cookies/jumbo-cookie-crumb-detail.jpg",
        alt: "Cookie interior detail",
      },
    ],
    categorySlug: "jumbo-cookies",
    categoryName: "Jumbo Cookies",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk, egg.",
  },
  {
    id: "product-jumbo-snickerdoodles",
    slug: "jumbo-snickerdoodles",
    name: "Jumbo Snickerdoodles",
    description: "Cinnamon-sugar cookies with a soft, snappy bite.",
    priceCents: 2500,
    unitsPerItem: 12,
    unitLabel: "dozen",
    imageUrl: "/assets/jumbo_cookies/jumbo-cookies-batch-secondary.jpg",
    imageAlt: "Batch of jumbo cookies",
    gallery: [
      {
        url: "/assets/jumbo_cookies/jumbo-cookies-batch-secondary.jpg",
        alt: "Batch of jumbo cookies",
      },
    ],
    categorySlug: "jumbo-cookies",
    categoryName: "Jumbo Cookies",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk, egg.",
  },
];

const products = rawProducts.map(enrichProduct);

const categoryOrder = [
  "artisan-sourdough",
  "bagels",
  "english-muffins",
  "cinnamon-rolls",
  "scones",
  "jumbo-cookies",
];

export function getPlaceholderShopMenu(): ShopCategory[] {
  const categories: ShopCategory[] = [];

  for (const slug of categoryOrder) {
    const lead = getCategoryLeadImage(slug);
    const categoryProducts = products.filter((p) => p.categorySlug === slug);
    if (categoryProducts.length === 0) continue;

    categories.push({
      id: slug,
      slug,
      name: categoryProducts[0].categoryName,
      blurb: null,
      leadImageUrl: lead.src,
      leadImageAlt: lead.alt,
      products: categoryProducts,
    });
  }

  return categories;
}

export function getPlaceholderProductBySlug(slug: string): ShopProduct | null {
  return products.find((p) => p.slug === slug) ?? null;
}

export function getPlaceholderProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

/** Canonical display order for shop page sections (by product slug). */
export const shopSectionProductOrder: Record<string, string[]> = {
  artisanLoaves: [
    "original-sourdough",
    "jalapeno-cheddar",
    "sun-dried-tomato-garlic",
    "double-chocolate",
    "croissant-loaf",
    "rosemary-garlic",
    "chili-crunch-cheddar-chive",
    "cinnamon-raisin",
  ],
  bagelsAndMuffins: [
    "bagels-original",
    "bagels-jalapeno-cheddar",
    "bagels-chili-crunch",
    "english-muffins",
  ],
  sweetTreats: [
    "cinnamon-rolls",
    "blueberry-scones",
    "jumbo-chocolate-chip",
    "jumbo-snickerdoodles",
  ],
};
