export const CART_STORAGE_KEY = "lucys-doughjo-cart-v1";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  optionId: string;
  optionLabel: string;
  tierQuantity: number;
  tierPriceCents: number;
  packs: number;
};

export type CartLineKey = {
  productId: string;
  optionId: string;
};

export function cartLineKey(line: CartLineKey) {
  return `${line.productId}:${line.optionId}`;
}

export function lineTotalCents(line: Pick<CartLine, "tierPriceCents" | "packs">) {
  return line.tierPriceCents * Math.max(0, line.packs);
}
