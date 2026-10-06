import { describe, expect, it } from "vitest";
import {
  cartLinesEqual,
  sanitizeCartImageUrl,
  sanitizeCartLine,
  sanitizeCartLines,
} from "@/lib/cart-sanitize";
import type { CartLine } from "@/lib/cart-types";

const validLine: CartLine = {
  productId: "p1",
  slug: "jalapeno-cheddar",
  name: "Jalapeño Cheddar",
  imageUrl: "https://cdn.sanity.io/images/test.jpg",
  optionId: "4-1600",
  optionLabel: "$16 each",
  tierQuantity: 4,
  tierPriceCents: 1600,
  packs: 2,
};

describe("sanitizeCartLine", () => {
  it("accepts a valid line", () => {
    expect(sanitizeCartLine(validLine)).toEqual(validLine);
  });

  it("rejects non-finite numbers", () => {
    expect(sanitizeCartLine({ ...validLine, packs: Infinity })).toBeNull();
    expect(sanitizeCartLine({ ...validLine, tierPriceCents: NaN })).toBeNull();
  });

  it("rejects negative prices and empty ids", () => {
    expect(sanitizeCartLine({ ...validLine, tierPriceCents: -1 })).toBeNull();
    expect(sanitizeCartLine({ ...validLine, productId: "" })).toBeNull();
  });

  it("clamps packs via finite int bounds", () => {
    expect(sanitizeCartLine({ ...validLine, packs: 100 })).toBeNull();
    expect(sanitizeCartLine({ ...validLine, packs: 0 })).toBeNull();
  });

  it("replaces disallowed image URLs with placeholder", () => {
    const line = sanitizeCartLine({
      ...validLine,
      imageUrl: "https://evil.example/x.png",
    });
    expect(line?.imageUrl).toBe(
      "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
    );
  });
});

describe("sanitizeCartImageUrl", () => {
  it("allows sanity CDN and site-relative paths", () => {
    expect(
      sanitizeCartImageUrl("https://cdn.sanity.io/images/x/y.jpg"),
    ).toContain("cdn.sanity.io");
    expect(sanitizeCartImageUrl("/assets/foo.jpg")).toBe("/assets/foo.jpg");
  });
});

describe("sanitizeCartLines", () => {
  it("dedupes by line key and caps line count", () => {
    const duplicate = { ...validLine };
    const many = Array.from({ length: 25 }, (_, index) => ({
      ...validLine,
      productId: `p${index}`,
      optionId: `opt${index}`,
    }));
    const result = sanitizeCartLines([validLine, duplicate, ...many]);
    expect(result).toHaveLength(20);
    expect(result[0]).toEqual(validLine);
  });
});

describe("cartLinesEqual", () => {
  it("detects pack differences", () => {
    expect(cartLinesEqual([validLine], [{ ...validLine, packs: 3 }])).toBe(
      false,
    );
  });
});
