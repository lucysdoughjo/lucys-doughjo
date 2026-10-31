import { sendOrderEmails } from "@/lib/email";
import type { OrderEmailPayload } from "@/lib/email/order-types";
import { isFullRefund } from "@/lib/checkout/order-lifecycle";
import {
  attachPaymentIntentToOrder,
  fulfillSucceededPayment,
  getOrderById,
  getOrderByPaymentIntentId,
  markOrderEmailsSent,
  refundPaidOrderInventory,
  refundStripePayment,
  releasePendingOrder,
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
    fulfillmentDateLabel: order.fulfillmentDateLabel,
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

async function sendConfirmationEmails(order: StoredOrder): Promise<void> {
  if (order.emailsSentAt) return;

  const settings = await getSiteFulfillmentSettings();
  const ownerEmail = settings?.contactEmail?.trim();
  if (!ownerEmail) return;

  const result = await sendOrderEmails({
    payload: orderToEmailPayload(order),
    ownerEmail,
  });
  if (result.ok) {
    await markOrderEmailsSent(order._id);
  }
}

async function loadOrderForPaymentIntent(input: {
  paymentIntentId: string;
  orderId?: string | null;
}): Promise<StoredOrder | null> {
  let order = await getOrderByPaymentIntentId(input.paymentIntentId);

  if (!order && input.orderId) {
    order = await getOrderById(input.orderId);
    if (order && !order.stripePaymentIntentId) {
      await attachPaymentIntentToOrder(order._id, input.paymentIntentId);
      order = { ...order, stripePaymentIntentId: input.paymentIntentId };
    }
  }

  return order;
}

async function refundMismatchedPayment(
  order: StoredOrder,
  paymentIntentId: string,
): Promise<void> {
  const refunded = await refundStripePayment(paymentIntentId);
  if (order.status === "pending") {
    await releasePendingOrder(order, "failed");
  }
  if (!refunded) {
    throw new Error(
      `Payment amount mismatch and refund failed for ${order._id}`,
    );
  }
}

export async function handlePaymentIntentSucceeded(input: {
  paymentIntentId: string;
  amountCents: number;
  orderId?: string | null;
}): Promise<StoredOrder> {
  const order = await loadOrderForPaymentIntent(input);

  if (!order) {
    throw new Error(
      `Order not found for payment intent ${input.paymentIntentId}`,
    );
  }

  if (input.amountCents !== order.totalCents) {
    console.error("Payment amount does not match order total", {
      paymentIntentId: input.paymentIntentId,
      orderId: order._id,
      amountCents: input.amountCents,
      totalCents: order.totalCents,
    });
    await refundMismatchedPayment(order, input.paymentIntentId);
    return (await getOrderByPaymentIntentId(input.paymentIntentId)) ?? order;
  }

  const result = await fulfillSucceededPayment(order);

  if (result.needsRefund) {
    const refunded = await refundStripePayment(input.paymentIntentId);
    if (!refunded) {
      throw new Error(`Could not refund late payment for order ${order._id}`);
    }
    return result.order ?? order;
  }

  if (!result.order) {
    throw new Error(`Could not mark order ${order._id} paid`);
  }

  if (result.incomplete) {
    throw new Error(`Inventory commit incomplete for order ${order._id}`);
  }

  revalidateShopAfterInventory(result.order.items.map((item) => item.slug));
  await sendConfirmationEmails(result.order);
  return (
    (await getOrderByPaymentIntentId(input.paymentIntentId)) ?? result.order
  );
}

export async function handlePaymentIntentCanceled(
  paymentIntentId: string,
): Promise<void> {
  const order = await getOrderByPaymentIntentId(paymentIntentId);
  if (!order || order.status !== "pending") {
    return;
  }

  await releasePendingOrder(order, "canceled");
}

export async function handleChargeRefunded(input: {
  paymentIntentId: string;
  amountRefundedCents: number;
}): Promise<void> {
  const order = await getOrderByPaymentIntentId(input.paymentIntentId);
  if (!order) return;

  if (!isFullRefund(input.amountRefundedCents, order.totalCents)) {
    return;
  }

  const refunded = await refundPaidOrderInventory(order);
  if (refunded) {
    revalidateShopAfterInventory(refunded.items.map((item) => item.slug));
  }
}
