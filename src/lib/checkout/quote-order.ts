import type { CartLine } from "@/lib/cart-types";
import { sanitizeCartLines } from "@/lib/cart-sanitize";
import { findPurchaseOptionForLine } from "@/lib/cart-validate";
import type { OrderWindowState } from "@/lib/order-window";
import {
  computeLineTotalCents,
  unitsFromLine,
} from "@/lib/pricing";
import type { SiteFulfillmentSettings } from "@/sanity/checkout-fetch";
import type { CheckoutProduct } from "@/sanity/shop-types";
import { normalizeUsPhone } from "./phone";
import { getNextSundayPacificLabel } from "./sunday-label";

export type FulfillmentMethod = "pickup" | "delivery";

export type QuoteCustomerInput = {
  name: string;
  email: string;
  phone: string;
  fulfillment: FulfillmentMethod;
  deliveryStreet?: string;
  deliveryCity?: string;
  deliveryZip?: string;
  orderNotes?: string | null;
};

export type QuoteLine = CartLine & {
  units: number;
  lineTotalCents: number;
};

export type OrderQuote = {
  lines: QuoteLine[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  fulfillmentDateLabel: string;
  weekStart: string | null;
  fulfillmentAddress: string;
  fulfillmentInstructions: string | null;
  customer: QuoteCustomerInput;
};

export type QuoteErrorCode =
  | "empty_cart"
  | "orders_closed"
  | "catalog_unavailable"
  | "settings_unavailable"
  | "product_unavailable"
  | "sold_out"
  | "option_unavailable"
  | "over_weekly_limit"
  | "pickup_not_configured"
  | "delivery_invalid"
  | "zip_not_allowed"
  | "minimum_amount"
  | "invalid_customer";

export type QuoteResult =
  | { ok: true; quote: OrderQuote }
  | { ok: false; code: QuoteErrorCode; message: string };

const MIN_TOTAL_CENTS = 50;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 40;
const MAX_NOTE = 500;
const MAX_STREET = 200;
const MAX_CITY = 80;

function cleanField(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeZip(zip: string) {
  return zip.trim().slice(0, 5);
}

export function quoteOrder(input: {
  cartLines: unknown;
  customer: QuoteCustomerInput;
  fulfillmentSettings: SiteFulfillmentSettings;
  productsBySlug: Map<string, CheckoutProduct>;
  orderWindow: OrderWindowState;
  weekStart: string | null;
  now?: Date;
}): QuoteResult {
  const lines = sanitizeCartLines(input.cartLines);
  if (lines.length === 0) {
    return {
      ok: false,
      code: "empty_cart",
      message: "Your cart is empty.",
    };
  }

  if (!input.orderWindow.isOpen) {
    return {
      ok: false,
      code: "orders_closed",
      message: input.orderWindow.label,
    };
  }

  const name = cleanField(input.customer.name, MAX_NAME);
  const email = cleanField(input.customer.email, MAX_EMAIL);
  const phone = normalizeUsPhone(cleanField(input.customer.phone, MAX_PHONE));
  const orderNotes = cleanField(input.customer.orderNotes, MAX_NOTE) || null;

  if (!name || !email || !isValidEmail(email)) {
    return {
      ok: false,
      code: "invalid_customer",
      message: "Please enter a valid name, email, and phone number.",
    };
  }

  if (!phone) {
    return {
      ok: false,
      code: "invalid_customer",
      message: "Please enter a valid 10-digit phone number.",
    };
  }

  const fulfillment = input.customer.fulfillment;
  let fulfillmentAddress = "";
  let fulfillmentInstructions: string | null = null;

  if (fulfillment === "pickup") {
    const pickup = input.fulfillmentSettings.pickupAddress?.trim();
    if (!pickup) {
      return {
        ok: false,
        code: "pickup_not_configured",
        message: "Pickup is not available right now. Please try delivery or contact us.",
      };
    }
    fulfillmentAddress = pickup;
    fulfillmentInstructions =
      input.fulfillmentSettings.pickupInstructions?.trim() || null;
  } else {
    const street = cleanField(input.customer.deliveryStreet, MAX_STREET);
    const city = cleanField(input.customer.deliveryCity, MAX_CITY);
    const zip = normalizeZip(input.customer.deliveryZip ?? "");

    if (!street || !city || !/^\d{5}$/.test(zip)) {
      return {
        ok: false,
        code: "delivery_invalid",
        message: "Please enter a complete delivery address with a 5-digit ZIP code.",
      };
    }

    const allowed = input.fulfillmentSettings.deliveryZipCodes.map((z) =>
      z.trim().slice(0, 5),
    );
    if (!allowed.includes(zip)) {
      return {
        ok: false,
        code: "zip_not_allowed",
        message: "Sorry — we don't deliver to that ZIP code for this drop.",
      };
    }

    fulfillmentAddress = `${street}, ${city}, CA ${zip}`;
    fulfillmentInstructions =
      input.fulfillmentSettings.deliveryNotes?.trim() || null;
  }

  const quotedLines: QuoteLine[] = [];
  const usedUnitsBySlug = new Map<string, number>();

  for (const line of lines) {
    const product = input.productsBySlug.get(line.slug);
    if (!product || !product.availableThisWeek) {
      return {
        ok: false,
        code: "product_unavailable",
        message: `${line.name} is no longer available this week.`,
      };
    }

    if (product.soldOut) {
      return {
        ok: false,
        code: "sold_out",
        message: `${product.name} is sold out.`,
      };
    }

    const option = findPurchaseOptionForLine(product, line);
    if (!option) {
      return {
        ok: false,
        code: "option_unavailable",
        message: `The pack option for ${product.name} changed. Please review your cart.`,
      };
    }

    const units = unitsFromLine(option.tierQuantity, line.packs);
    const alreadyQuoted = usedUnitsBySlug.get(product.slug) ?? 0;

    if (product.weeklyLimit !== null) {
      const remaining =
        product.weeklyLimit -
        product.unitsSoldThisWeek -
        product.unitsReservedThisWeek -
        alreadyQuoted;
      if (units > remaining) {
        return {
          ok: false,
          code: "over_weekly_limit",
          message: `Only ${Math.max(0, remaining)} of ${product.name} left this week.`,
        };
      }
    }

    usedUnitsBySlug.set(product.slug, alreadyQuoted + units);

    quotedLines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      optionId: option.id,
      optionLabel: option.label,
      tierQuantity: option.tierQuantity,
      tierPriceCents: option.tierPriceCents,
      packs: line.packs,
      units,
      lineTotalCents: computeLineTotalCents(option.tierPriceCents, line.packs),
    });
  }

  const subtotalCents = quotedLines.reduce(
    (sum, line) => sum + line.lineTotalCents,
    0,
  );
  const deliveryFeeCents =
    fulfillment === "delivery"
      ? Math.max(0, input.fulfillmentSettings.deliveryFeeCents)
      : 0;
  const totalCents = subtotalCents + deliveryFeeCents;

  if (totalCents < MIN_TOTAL_CENTS) {
    return {
      ok: false,
      code: "minimum_amount",
      message: "Order total is below the minimum charge amount.",
    };
  }

  return {
    ok: true,
    quote: {
      lines: quotedLines,
      subtotalCents,
      deliveryFeeCents,
      totalCents,
      fulfillmentDateLabel: getNextSundayPacificLabel(input.now),
      weekStart: input.weekStart,
      fulfillmentAddress,
      fulfillmentInstructions,
      customer: {
        name,
        email,
        phone,
        fulfillment,
        deliveryStreet: input.customer.deliveryStreet,
        deliveryCity: input.customer.deliveryCity,
        deliveryZip: input.customer.deliveryZip,
        orderNotes,
      },
    },
  };
}
