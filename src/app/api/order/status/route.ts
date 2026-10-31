import { NextResponse } from "next/server";
import { handlePaymentIntentSucceeded } from "@/lib/checkout/fulfill-payment";
import { getOrderByPaymentIntentId } from "@/lib/checkout/orders";
import { getStripeServerClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get("payment_intent")?.trim();

  if (!paymentIntentId) {
    return NextResponse.json({ error: "Missing payment_intent." }, { status: 400 });
  }

  let order = await getOrderByPaymentIntentId(paymentIntentId);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.status === "pending") {
    const stripe = getStripeServerClient();
    if (stripe) {
      try {
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (intent.status === "succeeded") {
          await handlePaymentIntentSucceeded(paymentIntentId);
          order = (await getOrderByPaymentIntentId(paymentIntentId)) ?? order;
        }
      } catch {
        // Ignore Stripe lookup errors; webhook may still be processing.
      }
    }
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    fulfillment: order.fulfillment,
    fulfillmentAddress: order.fulfillmentAddress,
    totalCents: order.totalCents,
  });
}
