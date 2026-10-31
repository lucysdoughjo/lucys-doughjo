import type { OrderQuote } from "@/lib/checkout/quote-order";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import {
  isPaymentStillInFlight,
  latePaymentAction,
  shouldApplyRefundToInventory,
  shouldSkipPaidCommitForWeekMismatch,
  type OrderStatus,
} from "@/lib/checkout/order-lifecycle";
import {
  applyWeekResetIfNeeded,
  mergeReservationUnits,
  nextInventoryAfterPaidCommit,
  nextInventoryAfterRefund,
  reservationWouldExceedLimit,
  type ReservationUnit,
} from "@/lib/checkout/reservation";
import {
  getCheckoutProductsBySlugs,
  getCurrentDropWeekStart,
} from "@/sanity/checkout-fetch";
import {
  incompletePaidOrdersQuery,
  incompleteRefundOrdersQuery,
  orderByIdQuery,
  orderByNumberQuery,
  orderByPaymentIntentQuery,
  priorWeekPendingOrdersQuery,
  productsForInventoryResetQuery,
  stalePendingOrdersQuery,
  unreleasedTerminalOrdersQuery,
} from "@/sanity/queries";
import { revalidateShopAfterInventory } from "@/lib/checkout/revalidate-shop";
import { getStripeServerClient } from "@/lib/stripe/server";
import {
  isSanityWriteConfigured,
  sanityWriteClient,
} from "@/sanity/write-client";
import type Stripe from "stripe";

export type { ReservationUnit, OrderStatus };

export type StoredOrder = {
  _id: string;
  _rev: string;
  orderNumber: string;
  status: OrderStatus;
  weekStart: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillment: "pickup" | "delivery";
  fulfillmentAddress: string;
  fulfillmentInstructions: string | null;
  fulfillmentDateLabel: string;
  orderNotes: string | null;
  items: OrderQuote["lines"];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  stripePaymentIntentId: string | null;
  emailsSentAt: string | null;
  inventoryCommittedAt: string | null;
  inventoryCommittedProductIds: string[];
  reservationReleasedAt: string | null;
  reservationReleasedProductIds: string[];
  refundedAt: string | null;
  refundInventoryReversedAt: string | null;
  refundInventoryReversedProductIds: string[];
  reservationUnits: ReservationUnit[];
  holdExpiresAt: string | null;
};

const RESERVE_RETRIES = 5;
const STALE_PENDING_MS = 30 * 60 * 1000;
const CRON_BATCH_SIZE = 100;

export function holdExpiresAtFromNow(now = new Date()): string {
  return new Date(now.getTime() + STALE_PENDING_MS).toISOString();
}

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

function reservationFromQuote(
  quote: OrderQuote,
  products: Map<string, { weeklyLimit: number | null }>,
) {
  const units: ReservationUnit[] = [];
  for (const line of quote.lines) {
    const product = products.get(line.slug);
    if (product?.weeklyLimit !== null && product?.weeklyLimit !== undefined) {
      units.push({ productId: line.productId, units: line.units });
    }
  }
  return mergeReservationUnits(units);
}

function weeklyLimitOf(doc: Record<string, unknown>): number | null {
  return typeof doc.weeklyLimit === "number" && doc.weeklyLimit > 0
    ? doc.weeklyLimit
    : null;
}

async function patchProductReservation(
  productId: string,
  deltaUnits: number,
  options: {
    currentWeekStart?: string | null;
    orderWeekStart?: string | null;
  } = {},
): Promise<boolean> {
  if (!isSanityWriteConfigured()) return false;

  for (let attempt = 0; attempt < RESERVE_RETRIES; attempt += 1) {
    const doc = await sanityWriteClient.getDocument(productId);
    if (!doc) return false;

    const reset = applyWeekResetIfNeeded({
      inventoryWeekStart: (doc.inventoryWeekStart as string) ?? null,
      currentWeekStart: options.currentWeekStart ?? null,
      unitsSold: (doc.unitsSoldThisWeek as number) ?? 0,
      unitsReserved: (doc.unitsReservedThisWeek as number) ?? 0,
      soldOut: Boolean(doc.soldOut),
    });

    if (
      deltaUnits < 0 &&
      options.orderWeekStart &&
      doc.inventoryWeekStart &&
      doc.inventoryWeekStart !== options.orderWeekStart
    ) {
      return true;
    }

    if (
      reservationWouldExceedLimit({
        weeklyLimit: weeklyLimitOf(doc),
        unitsSold: reset.unitsSold,
        unitsReserved: reset.unitsReserved,
        deltaUnits,
      })
    ) {
      return false;
    }

    const nextReserved = Math.max(0, reset.unitsReserved + deltaUnits);
    const patch = sanityWriteClient
      .patch(productId)
      .ifRevisionId(doc._rev)
      .set({
        unitsReservedThisWeek: nextReserved,
        unitsSoldThisWeek: reset.unitsSold,
        soldOut: reset.soldOut,
      });

    if (options.currentWeekStart) {
      patch.set({ inventoryWeekStart: options.currentWeekStart });
    }

    try {
      await patch.commit();
      return true;
    } catch {
      // Revision conflict — retry with a fresh document.
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
    const success = await patchProductReservation(entry.productId, entry.units, {
      currentWeekStart: quote.weekStart,
    });
    if (!success) {
      await releaseReservationUnits(applied, {
        currentWeekStart: quote.weekStart,
        orderWeekStart: quote.weekStart,
      });
      return { ok: false };
    }
    applied.push(entry);
  }

  return { ok: true, reservationUnits };
}

export async function releaseReservationUnits(
  units: ReservationUnit[],
  options: {
    currentWeekStart?: string | null;
    orderWeekStart?: string | null;
  } = {},
): Promise<boolean> {
  let allOk = true;
  for (const entry of units) {
    const ok = await patchProductReservation(
      entry.productId,
      -entry.units,
      options,
    );
    if (!ok) allOk = false;
  }
  return allOk;
}

async function generateUniqueOrderNumber(
  weekStart: string | null,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = generateOrderNumber(weekStart);
    const existing = await sanityWriteClient.fetch(orderByNumberQuery, {
      orderNumber,
    });
    if (!existing) return orderNumber;
  }
  return generateOrderNumber(weekStart);
}

export async function createPendingOrder(
  quote: OrderQuote,
  reservationUnits: ReservationUnit[],
): Promise<StoredOrder | null> {
  if (!isSanityWriteConfigured()) return null;

  const orderNumber = await generateUniqueOrderNumber(quote.weekStart);
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
    fulfillmentDateLabel: quote.fulfillmentDateLabel,
    orderNotes: quote.customer.orderNotes,
    items: quoteToSanityItems(quote),
    subtotalCents: quote.subtotalCents,
    deliveryFeeCents: quote.deliveryFeeCents,
    totalCents: quote.totalCents,
    stripePaymentIntentId: null,
    reservationUnits: reservationUnits.map((unit) => ({
      _key: unit.productId,
      productId: unit.productId,
      units: unit.units,
    })),
    holdExpiresAt: holdExpiresAtFromNow(),
  };

  const created = await sanityWriteClient.create(doc);
  return mapStoredOrder(created);
}

export async function attachPaymentIntentToOrder(
  orderId: string,
  paymentIntentId: string,
): Promise<void> {
  if (!isSanityWriteConfigured()) return;
  await sanityWriteClient
    .patch(orderId)
    .set({ stripePaymentIntentId: paymentIntentId })
    .commit();
}

export async function getOrderById(
  orderId: string,
): Promise<StoredOrder | null> {
  if (!isSanityWriteConfigured()) return null;
  const doc = await sanityWriteClient.fetch(orderByIdQuery, { orderId });
  if (!doc) return null;
  return mapStoredOrder(doc);
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
    _rev: String(doc._rev ?? ""),
    orderNumber: String(doc.orderNumber ?? ""),
    status: (doc.status as OrderStatus) ?? "pending",
    weekStart: (doc.weekStart as string) ?? null,
    customerName: String(doc.customerName ?? ""),
    customerEmail: String(doc.customerEmail ?? ""),
    customerPhone: String(doc.customerPhone ?? ""),
    fulfillment: (doc.fulfillment as "pickup" | "delivery") ?? "pickup",
    fulfillmentAddress: String(doc.fulfillmentAddress ?? ""),
    fulfillmentInstructions: (doc.fulfillmentInstructions as string) ?? null,
    fulfillmentDateLabel: String(doc.fulfillmentDateLabel ?? ""),
    orderNotes: (doc.orderNotes as string) ?? null,
    items: (doc.items as StoredOrder["items"]) ?? [],
    subtotalCents: Number(doc.subtotalCents ?? 0),
    deliveryFeeCents: Number(doc.deliveryFeeCents ?? 0),
    totalCents: Number(doc.totalCents ?? 0),
    stripePaymentIntentId: (doc.stripePaymentIntentId as string) ?? null,
    emailsSentAt: (doc.emailsSentAt as string) ?? null,
    inventoryCommittedAt: (doc.inventoryCommittedAt as string) ?? null,
    inventoryCommittedProductIds: Array.isArray(doc.inventoryCommittedProductIds)
      ? doc.inventoryCommittedProductIds.map(String)
      : [],
    reservationReleasedAt: (doc.reservationReleasedAt as string) ?? null,
    reservationReleasedProductIds: Array.isArray(
      doc.reservationReleasedProductIds,
    )
      ? doc.reservationReleasedProductIds.map(String)
      : [],
    refundedAt: (doc.refundedAt as string) ?? null,
    refundInventoryReversedAt: (doc.refundInventoryReversedAt as string) ?? null,
    refundInventoryReversedProductIds: Array.isArray(
      doc.refundInventoryReversedProductIds,
    )
      ? doc.refundInventoryReversedProductIds.map(String)
      : [],
    holdExpiresAt: (doc.holdExpiresAt as string) ?? null,
    reservationUnits: Array.isArray(doc.reservationUnits)
      ? mergeReservationUnits(
          doc.reservationUnits.map(
            (entry: { productId?: string; units?: number }) => ({
              productId: String(entry.productId ?? ""),
              units: Number(entry.units ?? 0),
            }),
          ),
        )
      : [],
  };
}

async function patchOrderIfRevision(
  order: StoredOrder,
  fields: Record<string, unknown>,
): Promise<boolean> {
  if (!isSanityWriteConfigured()) return false;
  try {
    await sanityWriteClient
      .patch(order._id)
      .ifRevisionId(order._rev)
      .set(fields)
      .commit();
    return true;
  } catch {
    return false;
  }
}

async function claimOrderPaid(order: StoredOrder): Promise<StoredOrder | null> {
  if (order.status === "paid") return order;
  if (order.status !== "pending") return null;

  const claimed = await patchOrderIfRevision(order, { status: "paid" });
  if (claimed) {
    return { ...order, status: "paid" };
  }

  const latest = await getOrderById(order._id);
  return latest?.status === "paid" ? latest : null;
}

async function reviveToPending(
  order: StoredOrder,
): Promise<StoredOrder | null> {
  if (order.status === "pending") return order;
  if (order.status !== "canceled" && order.status !== "failed") return null;

  const claimed = await patchOrderIfRevision(order, { status: "pending" });
  if (claimed) {
    return { ...order, status: "pending" };
  }

  const latest = await getOrderById(order._id);
  if (latest?.status === "pending" || latest?.status === "paid") {
    return latest;
  }
  return null;
}

async function claimPendingStatus(
  order: StoredOrder,
  status: "canceled" | "failed",
): Promise<StoredOrder | null> {
  if (order.status !== "pending") return null;

  const claimed = await patchOrderIfRevision(order, { status });
  if (claimed) {
    return { ...order, status };
  }

  return null;
}

async function commitOneProduct(
  order: StoredOrder,
  entry: ReservationUnit,
): Promise<boolean> {
  for (let attempt = 0; attempt < RESERVE_RETRIES; attempt += 1) {
    const doc = await sanityWriteClient.getDocument(entry.productId);
    if (!doc) return false;

    const inventoryWeekStart = (doc.inventoryWeekStart as string) ?? null;
    if (
      shouldSkipPaidCommitForWeekMismatch({
        inventoryWeekStart,
        orderWeekStart: order.weekStart,
      })
    ) {
      return true;
    }

    const reset = applyWeekResetIfNeeded({
      inventoryWeekStart,
      currentWeekStart: order.weekStart,
      unitsSold: (doc.unitsSoldThisWeek as number) ?? 0,
      unitsReserved: (doc.unitsReservedThisWeek as number) ?? 0,
      soldOut: Boolean(doc.soldOut),
    });

    const next = nextInventoryAfterPaidCommit({
      unitsSold: reset.unitsSold,
      unitsReserved: reset.unitsReserved,
      units: entry.units,
      reservationAlreadyReleased: Boolean(order.reservationReleasedAt),
      weeklyLimit: weeklyLimitOf(doc),
      soldOut: reset.soldOut,
    });

    try {
      const patch = sanityWriteClient
        .patch(entry.productId)
        .ifRevisionId(doc._rev)
        .set({
          unitsSoldThisWeek: next.unitsSold,
          unitsReservedThisWeek: next.unitsReserved,
          soldOut: next.soldOut,
        });
      if (
        order.weekStart &&
        (!inventoryWeekStart || inventoryWeekStart === order.weekStart)
      ) {
        patch.set({ inventoryWeekStart: order.weekStart });
      }
      await patch.commit();
      return true;
    } catch {
      // Retry against the latest revision.
    }
  }

  return false;
}

export async function commitPaidOrderInventory(
  order: StoredOrder,
): Promise<StoredOrder> {
  if (!isSanityWriteConfigured() || order.inventoryCommittedAt) {
    return order;
  }

  const committed = new Set(order.inventoryCommittedProductIds);

  for (const entry of order.reservationUnits) {
    if (committed.has(entry.productId)) continue;

    const success = await commitOneProduct(order, entry);
    if (!success) {
      console.error("Inventory commit failed", {
        orderId: order._id,
        productId: entry.productId,
      });
      break;
    }

    committed.add(entry.productId);
    const latest = (await getOrderById(order._id)) ?? order;
    await sanityWriteClient
      .patch(order._id)
      .set({ inventoryCommittedProductIds: [...committed] })
      .commit();
    order = {
      ...latest,
      inventoryCommittedProductIds: [...committed],
    };
  }

  const allCommitted = order.reservationUnits.every((entry) =>
    committed.has(entry.productId),
  );
  if (!allCommitted) {
    return { ...order, inventoryCommittedProductIds: [...committed] };
  }

  const committedAt = new Date().toISOString();
  await sanityWriteClient
    .patch(order._id)
    .set({
      inventoryCommittedAt: committedAt,
      inventoryCommittedProductIds: [...committed],
    })
    .commit();

  return {
    ...order,
    inventoryCommittedAt: committedAt,
    inventoryCommittedProductIds: [...committed],
  };
}

export async function markOrderPaidAndCommitInventory(
  order: StoredOrder,
): Promise<StoredOrder | null> {
  const result = await fulfillSucceededPayment(order);
  if (result.needsRefund || !result.order) return null;
  return result.order;
}

async function reReserveOrderUnits(order: StoredOrder): Promise<boolean> {
  if (order.reservationUnits.length === 0) {
    await sanityWriteClient
      .patch(order._id)
      .unset(["reservationReleasedAt"])
      .set({ reservationReleasedProductIds: [] })
      .commit();
    return true;
  }

  const applied: ReservationUnit[] = [];
  for (const entry of order.reservationUnits) {
    const success = await patchProductReservation(entry.productId, entry.units, {
      currentWeekStart: order.weekStart,
    });
    if (!success) {
      await releaseReservationUnits(applied, {
        currentWeekStart: order.weekStart,
        orderWeekStart: order.weekStart,
      });
      return false;
    }
    applied.push(entry);
  }

  await sanityWriteClient
    .patch(order._id)
    .unset(["reservationReleasedAt"])
    .set({ reservationReleasedProductIds: [] })
    .commit();
  return true;
}

export async function refundStripePayment(
  paymentIntentId: string,
): Promise<boolean> {
  const stripe = getStripeServerClient();
  if (!stripe) return false;

  try {
    await stripe.refunds.create({ payment_intent: paymentIntentId });
    return true;
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (code === "charge_already_refunded") return true;
    console.error("Stripe refund failed", { paymentIntentId, error });
    return false;
  }
}

export async function fulfillSucceededPayment(order: StoredOrder): Promise<{
  order: StoredOrder | null;
  needsRefund: boolean;
  incomplete: boolean;
}> {
  if (!isSanityWriteConfigured()) {
    return { order: null, needsRefund: false, incomplete: true };
  }

  const latest = (await getOrderById(order._id)) ?? order;
  const action = latePaymentAction({
    status: latest.status,
    reservationReleasedAt: latest.reservationReleasedAt,
    orderWeekStart: latest.weekStart,
    currentWeekStart: await getCurrentDropWeekStart(),
  });

  if (action === "ignore") {
    return { order: latest, needsRefund: false, incomplete: false };
  }

  if (action === "refund") {
    return { order: latest, needsRefund: true, incomplete: false };
  }

  let working = latest;

  if (action === "rereserve") {
    const reserved = await reReserveOrderUnits(working);
    if (!reserved) {
      return { order: working, needsRefund: true, incomplete: false };
    }
    working = (await getOrderById(working._id)) ?? working;
  }

  if (working.status === "canceled" || working.status === "failed") {
    const pending = await reviveToPending(working);
    if (!pending) {
      return { order: working, needsRefund: true, incomplete: false };
    }
    working = pending;
  }

  if (working.status !== "paid") {
    const paid = await claimOrderPaid(working);
    if (!paid) {
      return { order: working, needsRefund: false, incomplete: true };
    }
    working = paid;
  }

  const committed = await commitPaidOrderInventory(working);
  return {
    order: committed,
    needsRefund: false,
    incomplete: Boolean(
      committed.reservationUnits.length > 0 && !committed.inventoryCommittedAt,
    ),
  };
}

export async function markOrderEmailsSent(orderId: string): Promise<void> {
  if (!isSanityWriteConfigured()) return;
  await sanityWriteClient
    .patch(orderId)
    .set({ emailsSentAt: new Date().toISOString() })
    .commit();
}

export async function releasePendingOrder(
  order: StoredOrder,
  status: "canceled" | "failed",
): Promise<boolean> {
  const latest = (await getOrderById(order._id)) ?? order;
  let working = latest;

  if (working.status === "pending") {
    const claimed = await claimPendingStatus(working, status);
    if (!claimed) return false;
    working = claimed;
  } else if (working.status !== "canceled" && working.status !== "failed") {
    return false;
  }

  if (working.reservationReleasedAt) {
    return true;
  }

  const released = new Set(working.reservationReleasedProductIds);
  let allReleased = true;

  for (const entry of working.reservationUnits) {
    if (released.has(entry.productId)) continue;

    const ok = await patchProductReservation(entry.productId, -entry.units, {
      currentWeekStart: working.weekStart,
      orderWeekStart: working.weekStart,
    });
    if (!ok) {
      allReleased = false;
      continue;
    }

    released.add(entry.productId);
    await sanityWriteClient
      .patch(working._id)
      .set({ reservationReleasedProductIds: [...released] })
      .commit();
  }

  if (!allReleased) {
    return false;
  }

  await sanityWriteClient
    .patch(working._id)
    .set({
      reservationReleasedAt: new Date().toISOString(),
      reservationReleasedProductIds: [...released],
    })
    .commit();

  revalidateShopAfterInventory(working.items.map((item) => item.slug));
  return true;
}

async function expireListedPendingOrders(
  ids: string[],
  onSucceeded?: (
    order: StoredOrder,
    intent: Stripe.PaymentIntent,
  ) => Promise<void>,
): Promise<number> {
  const stripe = getStripeServerClient();
  let expired = 0;

  for (const id of ids) {
    try {
      const order = await getOrderById(id);
      if (!order || order.status !== "pending") continue;

      if (order.stripePaymentIntentId && stripe) {
        try {
          const intent = await stripe.paymentIntents.retrieve(
            order.stripePaymentIntentId,
          );
          if (intent.status === "succeeded") {
            if (onSucceeded) {
              await onSucceeded(order, intent);
            } else {
              const result = await fulfillSucceededPayment(order);
              if (result.needsRefund) {
                await refundStripePayment(order.stripePaymentIntentId);
              }
            }
            continue;
          }
          if (isPaymentStillInFlight(intent.status)) {
            continue;
          }
          if (intent.status !== "canceled") {
            try {
              await stripe.paymentIntents.cancel(order.stripePaymentIntentId);
            } catch {
              // Already uncancelable — re-check before releasing.
            }
            const again = await stripe.paymentIntents.retrieve(
              order.stripePaymentIntentId,
            );
            if (again.status === "succeeded") {
              if (onSucceeded) {
                await onSucceeded(order, again);
              } else {
                const result = await fulfillSucceededPayment(order);
                if (result.needsRefund) {
                  await refundStripePayment(order.stripePaymentIntentId);
                }
              }
              continue;
            }
            if (isPaymentStillInFlight(again.status)) {
              continue;
            }
          }
        } catch {
          // Stripe lookup failed — leave pending for the next sweep.
          continue;
        }
      }

      const released = await releasePendingOrder(order, "canceled");
      if (released) expired += 1;
    } catch {
      // Leave this order for the next sweep.
    }
  }

  return expired;
}

export async function expireStalePendingOrders(
  now = new Date(),
  onSucceeded?: (
    order: StoredOrder,
    intent: Stripe.PaymentIntent,
  ) => Promise<void>,
): Promise<number> {
  if (!isSanityWriteConfigured()) return 0;

  const cutoff = new Date(now.getTime() - STALE_PENDING_MS).toISOString();
  const stale = await sanityWriteClient.fetch(stalePendingOrdersQuery, {
    now: now.toISOString(),
    cutoff,
  });

  if (!Array.isArray(stale) || stale.length === 0) {
    return 0;
  }

  return expireListedPendingOrders(
    stale.map((doc: { _id?: string }) => String(doc._id ?? "")).filter(Boolean),
    onSucceeded,
  );
}

export async function expirePriorWeekPendingOrders(
  weekStart: string | null,
): Promise<number> {
  if (!isSanityWriteConfigured() || !weekStart) return 0;

  const stale = await sanityWriteClient.fetch(priorWeekPendingOrdersQuery, {
    weekStart,
  });
  if (!Array.isArray(stale) || stale.length === 0) {
    return 0;
  }

  return expireListedPendingOrders(
    stale.map((doc: { _id?: string }) => String(doc._id ?? "")).filter(Boolean),
    undefined,
  );
}

export async function resetWeeklyInventoryIfNeeded(
  weekStart: string | null,
): Promise<number> {
  if (!isSanityWriteConfigured() || !weekStart) return 0;

  const products = await sanityWriteClient.fetch(
    productsForInventoryResetQuery,
    { weekStart },
  );
  if (!Array.isArray(products) || products.length === 0) {
    return 0;
  }

  let reset = 0;
  for (const product of products as Array<{ _id: string; _rev?: string }>) {
    for (let attempt = 0; attempt < RESERVE_RETRIES; attempt += 1) {
      const doc = await sanityWriteClient.getDocument(product._id);
      if (!doc) break;
      if (doc.inventoryWeekStart === weekStart) {
        reset += 1;
        break;
      }

      try {
        await sanityWriteClient
          .patch(product._id)
          .ifRevisionId(doc._rev)
          .set({
            unitsSoldThisWeek: 0,
            unitsReservedThisWeek: 0,
            soldOut: false,
            inventoryWeekStart: weekStart,
          })
          .commit();
        reset += 1;
        break;
      } catch {
        // Retry.
      }
    }
  }

  if (reset > 0) {
    revalidateShopAfterInventory();
  }

  return reset;
}

export async function prepareInventoryForWeek(
  weekStart: string | null,
): Promise<void> {
  await expirePriorWeekPendingOrders(weekStart);
  await resetWeeklyInventoryIfNeeded(weekStart);
}

export async function refundPaidOrderInventory(
  order: StoredOrder,
): Promise<StoredOrder | null> {
  if (!isSanityWriteConfigured()) return null;

  const latest = (await getOrderById(order._id)) ?? order;
  if (latest.refundInventoryReversedAt) {
    return latest;
  }
  if (latest.status !== "paid" && latest.status !== "refunded") {
    return null;
  }

  let refunded = latest;
  if (latest.status !== "refunded") {
    const refundedAt = new Date().toISOString();
    const claimed = await patchOrderIfRevision(latest, {
      status: "refunded",
      refundedAt,
    });
    refunded = claimed
      ? { ...latest, status: "refunded", refundedAt }
      : ((await getOrderById(latest._id)) ?? latest);
  }

  if (refunded.status !== "refunded") {
    return refunded;
  }

  if (!refunded.inventoryCommittedAt) {
    return refunded;
  }

  const reversed = new Set(refunded.refundInventoryReversedProductIds);

  for (const entry of refunded.reservationUnits) {
    if (reversed.has(entry.productId)) continue;

    let applied = false;
    for (let attempt = 0; attempt < RESERVE_RETRIES; attempt += 1) {
      const doc = await sanityWriteClient.getDocument(entry.productId);
      if (!doc) break;

      const inventoryWeekStart = (doc.inventoryWeekStart as string) ?? null;
      if (
        !shouldApplyRefundToInventory({
          inventoryWeekStart,
          orderWeekStart: refunded.weekStart,
        })
      ) {
        applied = true;
        break;
      }

      const next = nextInventoryAfterRefund({
        unitsSold: (doc.unitsSoldThisWeek as number) ?? 0,
        units: entry.units,
        weeklyLimit: weeklyLimitOf(doc),
        soldOut: Boolean(doc.soldOut),
      });

      try {
        await sanityWriteClient
          .patch(entry.productId)
          .ifRevisionId(doc._rev)
          .set({
            unitsSoldThisWeek: next.unitsSold,
            soldOut: next.soldOut,
          })
          .commit();
        applied = true;
        break;
      } catch {
        // Retry.
      }
    }

    if (!applied) {
      console.error("Refund inventory reverse failed", {
        orderId: refunded._id,
        productId: entry.productId,
      });
      break;
    }

    reversed.add(entry.productId);
    await sanityWriteClient
      .patch(refunded._id)
      .set({ refundInventoryReversedProductIds: [...reversed] })
      .commit();
  }

  const allReversed = refunded.reservationUnits.every((entry) =>
    reversed.has(entry.productId),
  );
  if (!allReversed) {
    return {
      ...refunded,
      refundInventoryReversedProductIds: [...reversed],
    };
  }

  const reversedAt = new Date().toISOString();
  await sanityWriteClient
    .patch(refunded._id)
    .set({
      refundInventoryReversedAt: reversedAt,
      refundInventoryReversedProductIds: [...reversed],
    })
    .commit();

  return {
    ...refunded,
    refundInventoryReversedAt: reversedAt,
    refundInventoryReversedProductIds: [...reversed],
  };
}

function idsFromQuery(docs: unknown): string[] {
  if (!Array.isArray(docs)) return [];
  return docs
    .map((doc: { _id?: string }) => String(doc._id ?? ""))
    .filter(Boolean)
    .slice(0, CRON_BATCH_SIZE);
}

export async function recoverIncompleteInventory(): Promise<{
  committed: number;
  released: number;
  refunded: number;
}> {
  if (!isSanityWriteConfigured()) {
    return { committed: 0, released: 0, refunded: 0 };
  }

  const [paidDocs, terminalDocs, refundDocs] = await Promise.all([
    sanityWriteClient.fetch(incompletePaidOrdersQuery),
    sanityWriteClient.fetch(unreleasedTerminalOrdersQuery),
    sanityWriteClient.fetch(incompleteRefundOrdersQuery),
  ]);

  let committed = 0;
  for (const id of idsFromQuery(paidDocs)) {
    const order = await getOrderById(id);
    if (!order) continue;
    const result = await fulfillSucceededPayment(order);
    if (result.order?.inventoryCommittedAt) committed += 1;
  }

  let released = 0;
  for (const id of idsFromQuery(terminalDocs)) {
    const order = await getOrderById(id);
    if (!order) continue;
    const status = order.status === "failed" ? "failed" : "canceled";
    if (await releasePendingOrder(order, status)) released += 1;
  }

  let refunded = 0;
  for (const id of idsFromQuery(refundDocs)) {
    const order = await getOrderById(id);
    if (!order) continue;
    const reversed = await refundPaidOrderInventory(order);
    if (reversed?.refundInventoryReversedAt) refunded += 1;
  }

  return { committed, released, refunded };
}
