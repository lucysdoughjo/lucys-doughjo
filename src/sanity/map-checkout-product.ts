import type { CheckoutProduct } from "@/sanity/shop-types";
import { mapSanityProduct } from "@/sanity/map-product";

export function mapCheckoutProduct(record: {
  _id?: string;
  _rev?: string;
  weeklyLimit?: number | null;
  unitsSoldThisWeek?: number | null;
  unitsReservedThisWeek?: number | null;
} & Parameters<typeof mapSanityProduct>[0]): CheckoutProduct | null {
  const base = mapSanityProduct(record);
  if (!base) return null;

  return {
    ...base,
    revision: record._rev ?? null,
    unitsSoldThisWeek: Math.max(0, record.unitsSoldThisWeek ?? 0),
    unitsReservedThisWeek: Math.max(0, record.unitsReservedThisWeek ?? 0),
  };
}
