import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  handlePaymentIntentFailedOrCanceled,
  handlePaymentIntentSucceeded,
} from "@/lib/checkout/fulfill-payment";
import {
  getStripeServerClient,
  getStripeWebhookSecret,
} from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(intent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailedOrCanceled(intent.id, "failed");
        break;
      }
      case "payment_intent.canceled": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailedOrCanceled(intent.id, "canceled");
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler error", error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
