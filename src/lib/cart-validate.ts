import type { CartLine } from "@/lib/cart-types";
import type { PurchaseOption } from "@/lib/pricing";
import type { OrderWindowState } from "@/lib/order-window";
import { getOrderWindowForSite } from "@/sanity/fetch";
import { getProductsBySlugs } from "@/sanity/shop-fetch";
import type { ShopProduct } from "@/sanity/shop-types";

export type ValidatedCartLine = CartLine & {
  soldOut: boolean;
  unavailable: boolean;
  priceChanged: boolean;
};

export type CartValidationSuccess = {
  ok: true;
  lines: ValidatedCartLine[];
  orderWindow: OrderWindowState;
};

export type CartValidationFailure = {
  ok: false;
  error: string;
};

export type CartValidationResult =
  | CartValidationSuccess
  | CartValidationFailure;

/** Match pack size first; fall back to option id when quantity match is ambiguous. */
export function findPurchaseOptionForLine(
  product: ShopProduct,
  line: CartLine,
): PurchaseOption | null {
  const byQuantity = product.purchaseOptions.filter(
    (candidate) => candidate.tierQuantity === line.tierQuantity,
  );

  if (byQuantity.length === 1) {
    return byQuantity[0];
  }

  if (byQuantity.length > 1) {
    const byId = byQuantity.find((candidate) => candidate.id === line.optionId);
    return byId ?? byQuantity[0];
  }

  return (
    product.purchaseOptions.find((candidate) => candidate.id === line.optionId) ??
    null
  );
}

export function validateLineAgainstProduct(
  line: CartLine,
  product: ShopProduct | null | undefined,
): ValidatedCartLine {
  if (!product || !product.availableThisWeek) {
    return {
      ...line,
      unavailable: true,
      soldOut: true,
      priceChanged: false,
    };
  }

  if (
    line.productId &&
    product.id &&
    line.productId !== product.slug &&
    line.productId !== product.id
  ) {
    // Stale id after CMS changes — still resolve by slug + pack size.
  }

  const option = findPurchaseOptionForLine(product, line);

  if (!option) {
    return {
      ...line,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      unavailable: true,
      soldOut: product.soldOut,
      priceChanged: false,
    };
  }

  const priceChanged =
    option.tierPriceCents !== line.tierPriceCents ||
    option.tierQuantity !== line.tierQuantity ||
    option.label !== line.optionLabel ||
    option.id !== line.optionId;

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.imageUrl,
    optionId: option.id,
    optionLabel: option.label,
    tierQuantity: option.tierQuantity,
    tierPriceCents: option.tierPriceCents,
    packs: line.packs,
    unavailable: false,
    soldOut: product.soldOut,
    priceChanged,
  };
}

export function validateCartLinesWithProducts(
  lines: CartLine[],
  productsBySlug: Map<string, ShopProduct>,
): ValidatedCartLine[] {
  return lines.map((line) =>
    validateLineAgainstProduct(line, productsBySlug.get(line.slug)),
  );
}

export function cartHasCheckoutBlockers(lines: ValidatedCartLine[]) {
  return lines.some((line) => line.unavailable || line.soldOut);
}

export async function validateCartLines(
  lines: CartLine[],
): Promise<CartValidationResult> {
  const uniqueSlugs = [...new Set(lines.map((line) => line.slug))];
  const productResult = await getProductsBySlugs(uniqueSlugs);

  if (!productResult.ok) {
    return {
      ok: false,
      error:
        "We couldn't refresh your cart from the menu. Check your connection and try again.",
    };
  }

  const validated = validateCartLinesWithProducts(lines, productResult.bySlug);
  const orderWindow = await getOrderWindowForSite();

  return {
    ok: true,
    lines: validated,
    orderWindow,
  };
}
