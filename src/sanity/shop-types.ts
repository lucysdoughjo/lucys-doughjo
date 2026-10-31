import type { PriceTier, PurchaseOption } from "@/lib/pricing";

export type ProductImage = {
  url: string;
  alt: string;
};

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  unitsPerItem: number;
  unitLabel: string;
  priceTiers: PriceTier[];
  purchaseOptions: PurchaseOption[];
  priceLabel: string;
  imageUrl: string;
  imageAlt: string;
  gallery: ProductImage[];
  categorySlug: string;
  categoryName: string;
  soldOut: boolean;
  availableThisWeek: boolean;
  allergens: string | null;
  weeklyLimit: number | null;
  unitsRemaining: number | null;
};

export type CheckoutProduct = ShopProduct & {
  revision: string | null;
  unitsSoldThisWeek: number;
  unitsReservedThisWeek: number;
};

export type ShopCategory = {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  leadImageUrl: string;
  leadImageAlt: string;
  products: ShopProduct[];
};

export type ShopMenu = {
  bakersNote: string | null;
  categories: ShopCategory[];
};
