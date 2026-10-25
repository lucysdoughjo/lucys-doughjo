import type { CartLine } from "@/lib/cart-types";
import type { OrderEmailLineItem } from "../../../emails/order-types";

export type OrderFulfillmentMethod = "pickup" | "delivery";

export type OrderEmailCustomer = {
  name: string;
  email: string;
  phone: string;
};

export type OrderEmailPayload = {
  orderNumber: string;
  customer: OrderEmailCustomer;
  fulfillment: OrderFulfillmentMethod;
  fulfillmentAddress: string;
  fulfillmentInstructions?: string | null;
  fulfillmentDateLabel: string;
  items: CartLine[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  orderNotes?: string | null;
};

export function cartLinesToEmailItems(lines: CartLine[]): OrderEmailLineItem[] {
  return lines.map((line) => ({
    key: `${line.productId}:${line.optionId}`,
    name: line.name,
    optionLabel: line.optionLabel,
    quantity: line.packs,
    lineTotalCents: line.tierPriceCents * Math.max(0, line.packs),
  }));
}

export function buildFulfillmentCopy(payload: OrderEmailPayload): {
  fulfillmentLabel: string;
  fulfillmentDetails: string;
} {
  const label =
    payload.fulfillment === "delivery" ? "Sunday delivery" : "Sunday pickup";

  const parts = [payload.fulfillmentAddress.trim()];
  if (payload.fulfillmentInstructions?.trim()) {
    parts.push(payload.fulfillmentInstructions.trim());
  }

  return {
    fulfillmentLabel: label,
    fulfillmentDetails: parts.filter(Boolean).join("\n\n"),
  };
}
