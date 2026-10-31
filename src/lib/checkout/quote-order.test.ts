import { describe, expect, it } from "vitest";
import type { CartLine } from "@/lib/cart-types";
import { quoteOrder } from "@/lib/checkout/quote-order";
import { buildPurchaseOptions } from "@/lib/pricing";
import type { CheckoutProduct } from "@/sanity/shop-types";
import type { SiteFulfillmentSettings } from "@/sanity/checkout-fetch";

const fulfillmentSettings: SiteFulfillmentSettings = {
  contactEmail: "hello@lucysdoughjo.com",
  pickupAddress: "123 Bakery Ln, Chino, CA",
  pickupInstructions: "Ring the bell",
  deliveryZipCodes: ["91708"],
  deliveryFeeCents: 500,
  deliveryNotes: "Sundays only",
};

function makeCheckoutProduct(
  overrides: Partial<CheckoutProduct> = {},
): CheckoutProduct {
  const purchaseOptions = buildPurchaseOptions({
    priceCents: 1000,
    unitsPerItem: 1,
    unitLabel: "each",
  });

  return {
    id: "product-1",
    slug: "test-loaf",
    name: "Test Loaf",
    description: "Test",
    priceCents: 1000,
    unitsPerItem: 1,
    unitLabel: "each",
    priceTiers: [],
    purchaseOptions,
    priceLabel: "$10",
    imageUrl: "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
    imageAlt: "Test",
    gallery: [],
    categorySlug: "artisan-sourdough",
    categoryName: "Artisan",
    soldOut: false,
    availableThisWeek: true,
    allergens: null,
    unitsRemaining: null,
    revision: "rev-1",
    weeklyLimit: null,
    unitsSoldThisWeek: 0,
    unitsReservedThisWeek: 0,
    ...overrides,
  };
}

const openWindow = {
  isOpen: true,
  status: "open" as const,
  label: "Open",
  closesAt: null,
  nextOpensAt: null,
};

const cartLine: CartLine = {
  productId: "product-1",
  slug: "test-loaf",
  name: "Test Loaf",
  imageUrl: "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
  optionId: purchaseOptionsId(),
  optionLabel: "$10 each",
  tierQuantity: 1,
  tierPriceCents: 1000,
  packs: 2,
};

function purchaseOptionsId() {
  return buildPurchaseOptions({ priceCents: 1000, unitsPerItem: 1 })[0].id;
}

describe("quoteOrder", () => {
  it("quotes pickup with server-side prices", () => {
    const product = makeCheckoutProduct();
    const result = quoteOrder({
      cartLines: [cartLine],
      customer: {
        name: "Lucy",
        email: "buyer@example.com",
        phone: "(909) 555-0100",
        fulfillment: "pickup",
      },
      fulfillmentSettings,
      productsBySlug: new Map([[product.slug, product]]),
      orderWindow: openWindow,
      weekStart: "2026-10-20",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.quote.subtotalCents).toBe(2000);
    expect(result.quote.deliveryFeeCents).toBe(0);
    expect(result.quote.totalCents).toBe(2000);
  });

  it("rejects closed order window", () => {
    const product = makeCheckoutProduct();
    const result = quoteOrder({
      cartLines: [cartLine],
      customer: {
        name: "Lucy",
        email: "buyer@example.com",
        phone: "(909) 555-0100",
        fulfillment: "pickup",
      },
      fulfillmentSettings,
      productsBySlug: new Map([[product.slug, product]]),
      orderWindow: {
        isOpen: false,
        status: "closed",
        label: "Closed",
        closesAt: null,
        nextOpensAt: null,
      },
      weekStart: null,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("orders_closed");
  });

  it("rejects delivery ZIP outside allowlist", () => {
    const product = makeCheckoutProduct();
    const result = quoteOrder({
      cartLines: [cartLine],
      customer: {
        name: "Lucy",
        email: "buyer@example.com",
        phone: "(909) 555-0100",
        fulfillment: "delivery",
        deliveryStreet: "1 Main St",
        deliveryCity: "Chino",
        deliveryZip: "90210",
      },
      fulfillmentSettings,
      productsBySlug: new Map([[product.slug, product]]),
      orderWindow: openWindow,
      weekStart: null,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("zip_not_allowed");
  });

  it("includes delivery fee for allowed ZIP", () => {
    const product = makeCheckoutProduct();
    const result = quoteOrder({
      cartLines: [cartLine],
      customer: {
        name: "Lucy",
        email: "buyer@example.com",
        phone: "(909) 555-0100",
        fulfillment: "delivery",
        deliveryStreet: "1 Main St",
        deliveryCity: "Chino",
        deliveryZip: "91708",
      },
      fulfillmentSettings,
      productsBySlug: new Map([[product.slug, product]]),
      orderWindow: openWindow,
      weekStart: null,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.quote.deliveryFeeCents).toBe(500);
    expect(result.quote.totalCents).toBe(2500);
  });

  it("rejects when weekly limit exceeded", () => {
    const product = makeCheckoutProduct({
      weeklyLimit: 3,
      unitsSoldThisWeek: 2,
      unitsReservedThisWeek: 0,
    });

    const result = quoteOrder({
      cartLines: [{ ...cartLine, packs: 2, tierQuantity: 1 }],
      customer: {
        name: "Lucy",
        email: "buyer@example.com",
        phone: "(909) 555-0100",
        fulfillment: "pickup",
      },
      fulfillmentSettings,
      productsBySlug: new Map([[product.slug, product]]),
      orderWindow: openWindow,
      weekStart: null,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("over_weekly_limit");
  });

  it("rejects an invalid phone number", () => {
    const product = makeCheckoutProduct();
    const result = quoteOrder({
      cartLines: [cartLine],
      customer: {
        name: "Lucy",
        email: "buyer@example.com",
        phone: "555-0100",
        fulfillment: "pickup",
      },
      fulfillmentSettings,
      productsBySlug: new Map([[product.slug, product]]),
      orderWindow: openWindow,
      weekStart: "2026-10-20",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("invalid_customer");
    expect(result.message).toBe("Please enter a valid 10-digit phone number.");
  });

  it("normalizes a valid US phone number", () => {
    const product = makeCheckoutProduct();
    const result = quoteOrder({
      cartLines: [cartLine],
      customer: {
        name: "Lucy",
        email: "buyer@example.com",
        phone: "+1 909-555-0100",
        fulfillment: "pickup",
      },
      fulfillmentSettings,
      productsBySlug: new Map([[product.slug, product]]),
      orderWindow: openWindow,
      weekStart: "2026-10-20",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.quote.customer.phone).toBe("(909) 555-0100");
  });
});
