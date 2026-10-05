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

const rawProducts: RawProduct[] = [
  {
    id: "product-jalapeno-cheddar",
    slug: "jalapeno-cheddar",
    name: "Jalapeño Cheddar",
    description:
      "Naturally leavened sourdough with a savory kick. Placeholder copy — confirm before launch.",
    priceCents: 1600,
    imageUrl: "/assets/artisan_sourdough/artisan-loaf-dark-inclusion.jpg",
    imageAlt: "Sliced sourdough loaf with visible inclusions",
    gallery: [
      {
        url: "/assets/artisan_sourdough/artisan-loaf-dark-inclusion.jpg",
        alt: "Sliced sourdough loaf with visible inclusions",
      },
      {
        url: "/assets/artisan_sourdough/artisan-loaf-crumb-detail.jpg",
        alt: "Crumb detail of sourdough slice",
      },
    ],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk.",
  },
  {
    id: "product-original-sourdough",
    slug: "original-sourdough",
    name: "Original Sourdough",
    description: "Classic hand-shaped loaf with a golden crust.",
    priceCents: 1400,
    imageUrl: "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
    imageAlt: "Round artisan sourdough loaf",
    gallery: [
      {
        url: "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
        alt: "Round artisan sourdough loaf",
      },
      {
        url: "/assets/artisan_sourdough/artisan-sourdough-secondary.jpg",
        alt: "Artisan sourdough loaf alternate angle",
      },
    ],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan Sourdough",
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
    priceTiers: [
      { quantity: 2, priceCents: 500, label: "2 for $5" },
      { quantity: 12, priceCents: 2500, label: "Dozen for $25" },
    ],
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
    id: "product-english-muffins",
    slug: "english-muffins",
    name: "English Muffins",
    description: "Hand-cut muffins with a golden cornmeal finish.",
    priceCents: 800,
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
    id: "product-bagels-original",
    slug: "bagels-original",
    name: "Original Bagels",
    description: "Small-batch bagels — sold as a 4-pack.",
    priceCents: 1000,
    unitsPerItem: 4,
    unitLabel: "4-pack",
    imageUrl: "/assets/bagels/bagels-assorted-primary.jpg",
    imageAlt: "Assorted bagels",
    gallery: [
      {
        url: "/assets/bagels/bagels-assorted-primary.jpg",
        alt: "Assorted bagels",
      },
    ],
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
    description: "Savory bagels — sold as a 4-pack.",
    priceCents: 1200,
    unitsPerItem: 4,
    unitLabel: "4-pack",
    imageUrl: "/assets/bagels/bagels-assorted-secondary.jpg",
    imageAlt: "Assorted bagels",
    gallery: [
      {
        url: "/assets/bagels/bagels-assorted-secondary.jpg",
        alt: "Assorted bagels",
      },
    ],
    categorySlug: "bagels",
    categoryName: "Bagels",
    soldOut: false,
    availableThisWeek: true,
    allergens: "Contains: wheat, milk.",
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
