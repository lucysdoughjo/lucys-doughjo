import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  handleChargeRefunded,
  handlePaymentIntentCanceled,
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
        await handlePaymentIntentSucceeded({
          paymentIntentId: intent.id,
          amountCents: intent.amount,
          orderId: intent.metadata?.orderId,
        });
        break;
      }
      case "payment_intent.canceled": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentCanceled(intent.id);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (paymentIntentId) {
          await handleChargeRefunded({
            paymentIntentId,
            amountRefundedCents: charge.amount_refunded,
          });
        }
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
