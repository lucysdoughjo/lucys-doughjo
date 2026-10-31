import { getNextSundayPacificLabel } from "@/lib/checkout/sunday-label";
import { sendOrderEmails } from "@/lib/email";
import type { OrderEmailPayload } from "@/lib/email/order-types";
import {
  expireStalePendingOrders,
  getOrderByPaymentIntentId,
  markOrderEmailsSent,
  markOrderPaidAndCommitInventory,
  markOrderStatus,
  releaseReservationUnits,
  type StoredOrder,
} from "@/lib/checkout/orders";
import { revalidateShopAfterInventory } from "@/lib/checkout/revalidate-shop";
import { getSiteFulfillmentSettings } from "@/sanity/checkout-fetch";

function orderToEmailPayload(order: StoredOrder): OrderEmailPayload {
  return {
    orderNumber: order.orderNumber,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
    },
    fulfillment: order.fulfillment,
    fulfillmentAddress: order.fulfillmentAddress,
    fulfillmentInstructions: order.fulfillmentInstructions,
    fulfillmentDateLabel: "",
    items: order.items.map((line) => ({
      productId: line.productId,
      slug: line.slug,
      name: line.name,
      imageUrl: line.imageUrl,
      optionId: line.optionId,
      optionLabel: line.optionLabel,
      tierQuantity: line.tierQuantity,
      tierPriceCents: line.tierPriceCents,
      packs: line.packs,
    })),
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    totalCents: order.totalCents,
    orderNotes: order.orderNotes,
  };
}

export async function handlePaymentIntentSucceeded(
  paymentIntentId: string,
): Promise<void> {
  const order = await getOrderByPaymentIntentId(paymentIntentId);
  if (!order) {
    return;
  }

  if (order.status === "paid") {
    return;
  }

  const paidOrder = await markOrderPaidAndCommitInventory(order._id, order);
  if (!paidOrder) {
    return;
  }

  revalidateShopAfterInventory(paidOrder.items.map((item) => item.slug));

  if (paidOrder.emailsSentAt) {
    return;
  }

  const settings = await getSiteFulfillmentSettings();
  const ownerEmail = settings.contactEmail?.trim();
  if (!ownerEmail) {
    return;
  }

  const payload = orderToEmailPayload(paidOrder);
  payload.fulfillmentDateLabel = getNextSundayPacificLabel();

  const result = await sendOrderEmails({ payload, ownerEmail });
  if (result.ok) {
    await markOrderEmailsSent(order._id);
  }
}

export async function handlePaymentIntentFailedOrCanceled(
  paymentIntentId: string,
  status: "failed" | "canceled",
): Promise<void> {
  const order = await getOrderByPaymentIntentId(paymentIntentId);
  if (!order || order.status === "paid") {
    return;
  }

  await releaseReservationUnits(order.reservationUnits);
  await markOrderStatus(order._id, status);
  revalidateShopAfterInventory(order.items.map((item) => item.slug));
  void expireStalePendingOrders();
}
