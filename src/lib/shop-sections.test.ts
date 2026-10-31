import { describe, expect, it } from "vitest";
import { buildShopDisplaySections } from "@/lib/shop-sections";
import type { ShopMenu, ShopProduct } from "@/sanity/shop-types";

function product(partial: Pick<ShopProduct, "slug" | "name" | "categorySlug">): ShopProduct {
  return {
    id: partial.slug,
    slug: partial.slug,
    name: partial.name,
    description: "",
    priceCents: 1000,
    unitsPerItem: 1,
    unitLabel: "each",
    priceTiers: [],
    purchaseOptions: [],
    priceLabel: "$10",
    imageUrl: "/x.jpg",
    imageAlt: partial.name,
    gallery: [],
    categorySlug: partial.categorySlug,
    categoryName: partial.categorySlug,
    soldOut: false,
    availableThisWeek: true,
    allergens: null,
    weeklyLimit: null,
    unitsRemaining: null,
  };
}

function menu(products: ShopProduct[]): ShopMenu {
  return {
    bakersNote: null,
    categories: [
      {
        id: "cat",
        slug: "cat",
        name: "Cat",
        blurb: null,
        leadImageUrl: "",
        leadImageAlt: "",
        products,
      },
    ],
  };
}

describe("buildShopDisplaySections", () => {
  it("keeps the known loaf order and appends new loaves from Sanity", () => {
    const olive = product({
      slug: "olive-rosemary",
      name: "Olive Rosemary",
      categorySlug: "artisan-sourdough",
    });
    const original = product({
      slug: "original-sourdough",
      name: "Original Sourdough",
      categorySlug: "artisan-sourdough",
    });

    const sections = buildShopDisplaySections(menu([olive, original]));
    const loaves = sections.find((section) => section.id === "artisan-loaves");

    expect(loaves?.products.map((item) => item.slug)).toEqual([
      "original-sourdough",
      "olive-rosemary",
    ]);
  });

  it("puts products from an unknown category in More this week", () => {
    const jam = product({
      slug: "strawberry-jam",
      name: "Strawberry Jam",
      categorySlug: "pantry",
    });

    const sections = buildShopDisplaySections(menu([jam]));
    expect(sections).toEqual([
      expect.objectContaining({
        id: "more-this-week",
        products: [jam],
      }),
    ]);
  });
});
