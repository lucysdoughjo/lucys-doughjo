import { describe, expect, it } from "vitest";
import type { CartLine } from "@/lib/cart-types";
import {
  cartHasCheckoutBlockers,
  findPurchaseOptionForLine,
  validateCartLinesWithProducts,
  validateLineAgainstProduct,
} from "@/lib/cart-validate";
import { buildPurchaseOptions } from "@/lib/pricing";
import type { ShopProduct } from "@/sanity/shop-types";

function makeProduct(overrides: Partial<ShopProduct> = {}): ShopProduct {
  const purchaseOptions = buildPurchaseOptions({
    priceCents: 1600,
    unitsPerItem: 4,
    unitLabel: "loaf",
  });

  return {
    id: "sanity-id-1",
    slug: "jalapeno-cheddar",
    name: "Jalapeño Cheddar",
    description: "Test",
    priceCents: 1600,
    unitsPerItem: 4,
    unitLabel: "loaf",
    priceTiers: [],
    purchaseOptions,
    priceLabel: "$16",
    imageUrl: "https://cdn.sanity.io/images/test.jpg",
    imageAlt: "Test",
    gallery: [],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan",
    soldOut: false,
    availableThisWeek: true,
    allergens: null,
    ...overrides,
  };
}

const baseLine: CartLine = {
  productId: "sanity-id-1",
  slug: "jalapeno-cheddar",
  name: "Jalapeño Cheddar",
  imageUrl: "https://cdn.sanity.io/images/test.jpg",
  optionId: "4-1600",
  optionLabel: "$16.00 loaf",
  tierQuantity: 4,
  tierPriceCents: 1600,
  packs: 1,
};

describe("findPurchaseOptionForLine", () => {
  it("rematches by tier quantity when price id changes", () => {
    const product = makeProduct({
      purchaseOptions: buildPurchaseOptions({
        priceCents: 1800,
        unitsPerItem: 4,
        unitLabel: "loaf",
      }),
    });

    const staleLine = { ...baseLine, optionId: "4-1600", tierPriceCents: 1600 };
    const option = findPurchaseOptionForLine(product, staleLine);
    expect(option?.tierPriceCents).toBe(1800);
    expect(option?.id).toBe("4-1800");
  });
});

describe("validateLineAgainstProduct", () => {
  it("marks missing products unavailable", () => {
    const result = validateLineAgainstProduct(baseLine, null);
    expect(result.unavailable).toBe(true);
    expect(cartHasCheckoutBlockers([result])).toBe(true);
  });

  it("syncs price from sanity and sets priceChanged", () => {
    const product = makeProduct({
      purchaseOptions: buildPurchaseOptions({
        priceCents: 1800,
        unitsPerItem: 4,
        unitLabel: "loaf",
      }),
    });

    const result = validateLineAgainstProduct(
      { ...baseLine, tierPriceCents: 1600, optionId: "4-1600" },
      product,
    );

    expect(result.priceChanged).toBe(true);
    expect(result.tierPriceCents).toBe(1800);
    expect(result.unavailable).toBe(false);
    expect(cartHasCheckoutBlockers([result])).toBe(false);
  });

  it("marks unavailable when pack size no longer exists", () => {
    const product = makeProduct({
      purchaseOptions: buildPurchaseOptions({
        priceCents: 800,
        unitsPerItem: 1,
      }),
    });

    const result = validateLineAgainstProduct(
      { ...baseLine, tierQuantity: 99, optionId: "99-9999" },
      product,
    );

    expect(result.unavailable).toBe(true);
    expect(cartHasCheckoutBlockers([result])).toBe(true);
  });
});

describe("validateCartLinesWithProducts", () => {
  it("validates each line against the product map", () => {
    const product = makeProduct();
    const map = new Map([[product.slug, product]]);
    const results = validateCartLinesWithProducts([baseLine], map);
    expect(results).toHaveLength(1);
    expect(results[0].tierPriceCents).toBe(1600);
  });
});
