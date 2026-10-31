import type { OrderQuote } from "@/lib/checkout/quote-order";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import {
  getCheckoutProductsBySlugs,
} from "@/sanity/checkout-fetch";
import {
  orderByPaymentIntentQuery,
  stalePendingOrdersQuery,
} from "@/sanity/queries";
import { getStripeServerClient } from "@/lib/stripe/server";
import {
  isSanityWriteConfigured,
  sanityWriteClient,
} from "@/sanity/write-client";

export type OrderStatus = "pending" | "paid" | "canceled" | "failed";

export type ReservationUnit = {
  productId: string;
  units: number;
};

export type StoredOrder = {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  weekStart: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillment: "pickup" | "delivery";
  fulfillmentAddress: string;
  fulfillmentInstructions: string | null;
  orderNotes: string | null;
  items: OrderQuote["lines"];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  stripePaymentIntentId: string | null;
  emailsSentAt: string | null;
  reservationUnits: ReservationUnit[];
};

const RESERVE_RETRIES = 3;

function quoteToSanityItems(quote: OrderQuote) {
  return quote.lines.map((line) => ({
    _key: `${line.productId}-${line.optionId}`,
    productId: line.productId,
    slug: line.slug,
    name: line.name,
    imageUrl: line.imageUrl,
    optionId: line.optionId,
    optionLabel: line.optionLabel,
    tierQuantity: line.tierQuantity,
    tierPriceCents: line.tierPriceCents,
    packs: line.packs,
    units: line.units,
    lineTotalCents: line.lineTotalCents,
  }));
}

function reservationFromQuote(quote: OrderQuote, products: Map<string, { weeklyLimit: number | null }>) {
  const units: ReservationUnit[] = [];
  for (const line of quote.lines) {
    const product = products.get(line.slug);
    if (product?.weeklyLimit !== null && product?.weeklyLimit !== undefined) {
      units.push({ productId: line.productId, units: line.units });
    }
  }
  return units;
}

async function patchProductReservation(
  productId: string,
  deltaUnits: number,
): Promise<boolean> {
  if (!isSanityWriteConfigured()) return false;

  for (let attempt = 0; attempt < RESERVE_RETRIES; attempt += 1) {
    const doc = await sanityWriteClient.getDocument(productId);
    if (!doc) return false;

    const current = Math.max(0, (doc.unitsReservedThisWeek as number) ?? 0);
    const next = Math.max(0, current + deltaUnits);

    try {
      await sanityWriteClient
        .patch(productId)
        .ifRevisionId(doc._rev)
        .set({ unitsReservedThisWeek: next })
        .commit();
      return true;
    } catch {
      // Revision conflict — retry with fresh document.
    }
  }

  return false;
}

export async function reserveUnitsForQuote(
  quote: OrderQuote,
): Promise<{ ok: true; reservationUnits: ReservationUnit[] } | { ok: false }> {
  const slugs = quote.lines.map((line) => line.slug);
  const products = await getCheckoutProductsBySlugs(slugs);
  const reservationUnits = reservationFromQuote(quote, products);

  const applied: ReservationUnit[] = [];
  for (const entry of reservationUnits) {
    const success = await patchProductReservation(entry.productId, entry.units);
    if (!success) {
      await releaseReservationUnits(applied);
      return { ok: false };
    }
    applied.push(entry);
  }

  return { ok: true, reservationUnits };
}

export async function releaseReservationUnits(units: ReservationUnit[]) {
  for (const entry of units) {
    await patchProductReservation(entry.productId, -entry.units);
  }
}

export async function createPendingOrder(
  quote: OrderQuote,
  reservationUnits: ReservationUnit[],
): Promise<StoredOrder | null> {
  if (!isSanityWriteConfigured()) return null;

  const orderNumber = generateOrderNumber(quote.weekStart);
  const doc = {
    _type: "order",
    orderNumber,
    status: "pending",
    weekStart: quote.weekStart,
    customerName: quote.customer.name,
    customerEmail: quote.customer.email,
    customerPhone: quote.customer.phone,
    fulfillment: quote.customer.fulfillment,
    fulfillmentAddress: quote.fulfillmentAddress,
    fulfillmentInstructions: quote.fulfillmentInstructions,
    orderNotes: quote.customer.orderNotes,
    items: quoteToSanityItems(quote),
    subtotalCents: quote.subtotalCents,
    deliveryFeeCents: quote.deliveryFeeCents,
    totalCents: quote.totalCents,
    stripePaymentIntentId: null,
    reservationUnits: reservationUnits.map((u) => ({
      _key: u.productId,
      productId: u.productId,
      units: u.units,
    })),
  };

  const created = await sanityWriteClient.create(doc);
  return mapStoredOrder(created);
}

export async function attachPaymentIntentToOrder(
  orderId: string,
  paymentIntentId: string,
): Promise<void> {
  if (!isSanityWriteConfigured()) return;
  await sanityWriteClient.patch(orderId).set({ stripePaymentIntentId: paymentIntentId }).commit();
}

export async function markOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  if (!isSanityWriteConfigured()) return;
  await sanityWriteClient.patch(orderId).set({ status }).commit();
}

export async function getOrderByPaymentIntentId(
  paymentIntentId: string,
): Promise<StoredOrder | null> {
  if (!isSanityWriteConfigured()) return null;
  const doc = await sanityWriteClient.fetch(orderByPaymentIntentQuery, {
    paymentIntentId,
  });
  if (!doc) return null;
  return mapStoredOrder(doc);
}

function mapStoredOrder(doc: Record<string, unknown>): StoredOrder {
  return {
    _id: String(doc._id),
    orderNumber: String(doc.orderNumber ?? ""),
    status: (doc.status as OrderStatus) ?? "pending",
    weekStart: (doc.weekStart as string) ?? null,
    customerName: String(doc.customerName ?? ""),
    customerEmail: String(doc.customerEmail ?? ""),
    customerPhone: String(doc.customerPhone ?? ""),
    fulfillment: (doc.fulfillment as "pickup" | "delivery") ?? "pickup",
    fulfillmentAddress: String(doc.fulfillmentAddress ?? ""),
    fulfillmentInstructions: (doc.fulfillmentInstructions as string) ?? null,
    orderNotes: (doc.orderNotes as string) ?? null,
    items: (doc.items as StoredOrder["items"]) ?? [],
    subtotalCents: Number(doc.subtotalCents ?? 0),
    deliveryFeeCents: Number(doc.deliveryFeeCents ?? 0),
    totalCents: Number(doc.totalCents ?? 0),
    stripePaymentIntentId: (doc.stripePaymentIntentId as string) ?? null,
    emailsSentAt: (doc.emailsSentAt as string) ?? null,
    reservationUnits: Array.isArray(doc.reservationUnits)
      ? doc.reservationUnits.map((entry: { productId?: string; units?: number }) => ({
          productId: String(entry.productId),
          units: Number(entry.units ?? 0),
        }))
      : [],
  };
}

export async function commitPaidOrderInventory(order: StoredOrder): Promise<void> {
  if (!isSanityWriteConfigured()) return;

  for (const entry of order.reservationUnits) {
    const doc = await sanityWriteClient.getDocument(entry.productId);
    if (!doc) continue;

    const sold = Math.max(0, (doc.unitsSoldThisWeek as number) ?? 0);
    const reserved = Math.max(0, (doc.unitsReservedThisWeek as number) ?? 0);
    const weeklyLimit =
      typeof doc.weeklyLimit === "number" && doc.weeklyLimit > 0
        ? doc.weeklyLimit
        : null;

    const nextSold = sold + entry.units;
    const nextReserved = Math.max(0, reserved - entry.units);
    const patch = sanityWriteClient
      .patch(entry.productId)
      .ifRevisionId(doc._rev)
      .set({
        unitsSoldThisWeek: nextSold,
        unitsReservedThisWeek: nextReserved,
      });

    if (weeklyLimit !== null && nextSold >= weeklyLimit) {
      patch.set({ soldOut: true });
    }

    try {
      await patch.commit();
    } catch {
      // Inventory commit failed — order is still paid; Lucy can reconcile in Studio.
    }
  }
}

export async function markOrderPaidAndCommitInventory(
  orderId: string,
  order: StoredOrder,
): Promise<StoredOrder | null> {
  if (!isSanityWriteConfigured()) return null;

  await sanityWriteClient.patch(orderId).set({ status: "paid" }).commit();
  await commitPaidOrderInventory(order);

  return { ...order, status: "paid" };
}

export async function markOrderEmailsSent(orderId: string): Promise<void> {
  if (!isSanityWriteConfigured()) return;
  await sanityWriteClient
    .patch(orderId)
    .set({ emailsSentAt: new Date().toISOString() })
    .commit();
}

const STALE_PENDING_MS = 30 * 60 * 1000;

export async function expireStalePendingOrders(now = new Date()): Promise<number> {
  if (!isSanityWriteConfigured()) return 0;

  const cutoff = new Date(now.getTime() - STALE_PENDING_MS).toISOString();
  const stale = await sanityWriteClient.fetch(stalePendingOrdersQuery, {
    cutoff,
  });

  if (!Array.isArray(stale) || stale.length === 0) {
    return 0;
  }

  const stripe = getStripeServerClient();
  let expired = 0;

  for (const doc of stale as Array<{
    _id: string;
    stripePaymentIntentId?: string | null;
    reservationUnits?: ReservationUnit[];
  }>) {
    try {
      if (doc.stripePaymentIntentId && stripe) {
        try {
          await stripe.paymentIntents.cancel(doc.stripePaymentIntentId);
        } catch {
          // Already canceled or uncancelable — still release inventory.
        }
      }

      const units = Array.isArray(doc.reservationUnits)
        ? doc.reservationUnits.map((entry) => ({
            productId: String(entry.productId),
            units: Number(entry.units ?? 0),
          }))
        : [];

      await releaseReservationUnits(units);
      await markOrderStatus(doc._id, "canceled");
      expired += 1;
    } catch {
      // Leave this order pending for the next sweep.
    }
  }

  return expired;
}
