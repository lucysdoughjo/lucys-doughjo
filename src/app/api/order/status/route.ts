import { NextResponse } from "next/server";
import {
  getOrderById,
  getOrderByPaymentIntentId,
} from "@/lib/checkout/orders";
import { getStripeServerClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get("payment_intent")?.trim();
  const clientSecret = searchParams
    .get("payment_intent_client_secret")
    ?.trim();

  if (!paymentIntentId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing payment reference." },
      { status: 400 },
    );
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Checkout is not configured." },
      { status: 503 },
    );
  }

  let intent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!intent.client_secret || intent.client_secret !== clientSecret) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  let order = await getOrderByPaymentIntentId(paymentIntentId);
  if (!order && intent.metadata?.orderId) {
    order = await getOrderById(intent.metadata.orderId);
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: intent.status,
  });
}
