import type { CartLine } from "@/lib/cart-types";
import { isEffectivelySoldOut } from "@/lib/inventory";
import type { PurchaseOption } from "@/lib/pricing";
import { unitsFromLine } from "@/lib/pricing";
import type { OrderWindowState } from "@/lib/order-window";
import { getOrderWindowForSite } from "@/sanity/fetch";
import { getProductsBySlugs } from "@/sanity/shop-fetch";
import type { ShopProduct } from "@/sanity/shop-types";

export type CartCatalogProduct = Pick<
  ShopProduct,
  | "id"
  | "slug"
  | "name"
  | "imageUrl"
  | "purchaseOptions"
  | "soldOut"
  | "availableThisWeek"
  | "unitsRemaining"
>;

export type ValidatedCartLine = CartLine & {
  soldOut: boolean;
  unavailable: boolean;
  priceChanged: boolean;
};

export function toCartCatalogProduct(product: ShopProduct): CartCatalogProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.imageUrl,
    purchaseOptions: product.purchaseOptions,
    soldOut: product.soldOut,
    availableThisWeek: product.availableThisWeek,
    unitsRemaining: product.unitsRemaining,
  };
}

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
  product: CartCatalogProduct,
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
  product: CartCatalogProduct | null | undefined,
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

  const units = unitsFromLine(option.tierQuantity, line.packs);
  const overLimit =
    product.unitsRemaining !== null && units > product.unitsRemaining;

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
    soldOut: isEffectivelySoldOut(product.soldOut, product.unitsRemaining) || overLimit,
    priceChanged,
  };
}

export function validateCartLinesWithProducts(
  lines: CartLine[],
  productsBySlug: Map<string, CartCatalogProduct>,
): ValidatedCartLine[] {
  const usedUnitsBySlug = new Map<string, number>();

  return lines.map((line) => {
    const product = productsBySlug.get(line.slug);
    const result = validateLineAgainstProduct(line, product);
    if (!product || result.unavailable) {
      return result;
    }

    const units = unitsFromLine(result.tierQuantity, result.packs);
    const alreadyUsed = usedUnitsBySlug.get(line.slug) ?? 0;
    usedUnitsBySlug.set(line.slug, alreadyUsed + units);

    if (
      product.unitsRemaining !== null &&
      alreadyUsed + units > product.unitsRemaining
    ) {
      return { ...result, soldOut: true };
    }

    return result;
  });
}

export function cartHasCheckoutBlockers(lines: ValidatedCartLine[]) {
  return lines.some((line) => line.unavailable || line.soldOut);
}

export async function validateCartLines(
  lines: CartLine[],
): Promise<CartValidationResult> {
  const uniqueSlugs = [...new Set(lines.map((line) => line.slug))];
  const [productResult, orderWindow] = await Promise.all([
    getProductsBySlugs(uniqueSlugs),
    getOrderWindowForSite(),
  ]);

  if (!productResult.ok) {
    return {
      ok: false,
      error:
        "We couldn't refresh your cart from the menu. Check your connection and try again.",
    };
  }

  return {
    ok: true,
    lines: validateCartLinesWithProducts(lines, productResult.bySlug),
    orderWindow,
  };
}
