import { NextResponse } from "next/server";
import { buildCheckoutQuote } from "@/lib/checkout/prepare-checkout";
import type { QuoteCustomerInput } from "@/lib/checkout/quote-order";
import {
  attachPaymentIntentToOrder,
  createPendingOrder,
  expireStalePendingOrders,
  markOrderStatus,
  releaseReservationUnits,
  reserveUnitsForQuote,
} from "@/lib/checkout/orders";
import {
  clientIpFromRequest,
  isCheckoutRateLimited,
} from "@/lib/checkout/rate-limit";
import { getStripeServerClient } from "@/lib/stripe/server";
import { isSanityWriteConfigured } from "@/sanity/write-client";

export const runtime = "nodejs";

type CheckoutBody = {
  lines?: unknown;
  customer?: Partial<QuoteCustomerInput>;
};

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  if (isCheckoutRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  if (!isSanityWriteConfigured()) {
    return NextResponse.json(
      { error: "Checkout is not configured on this server (Sanity write token)." },
      { status: 503 },
    );
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Checkout is not configured on this server (Stripe)." },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const customer = body.customer;
  if (!customer?.fulfillment) {
    return NextResponse.json(
      { error: "Missing fulfillment method." },
      { status: 400 },
    );
  }

  const quoteResult = await buildCheckoutQuote({
    cartLines: body.lines,
    customer: {
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      fulfillment: customer.fulfillment,
      deliveryStreet: customer.deliveryStreet,
      deliveryCity: customer.deliveryCity,
      deliveryZip: customer.deliveryZip,
      orderNotes: customer.orderNotes ?? null,
    },
  });

  if (!quoteResult.ok) {
    return NextResponse.json(
      { error: quoteResult.message, code: quoteResult.code },
      { status: 400 },
    );
  }

  const quote = quoteResult.quote;
  void expireStalePendingOrders();
  const reserveResult = await reserveUnitsForQuote(quote);
  if (!reserveResult.ok) {
    return NextResponse.json(
      {
        error: "Something in your cart just sold out. Please return to the cart and try again.",
        code: "over_weekly_limit",
      },
      { status: 409 },
    );
  }

  const order = await createPendingOrder(quote, reserveResult.reservationUnits);
  if (!order) {
    await releaseReservationUnits(reserveResult.reservationUnits);
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 },
    );
  }

  const description = quote.lines
    .map((line) => `${line.name} — ${line.optionLabel} × ${line.packs}`)
    .join("; ")
    .slice(0, 500);

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: quote.totalCents,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        receipt_email: quote.customer.email,
        description,
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          weekStart: quote.weekStart ?? "",
          fulfillment: quote.customer.fulfillment,
        },
      },
      { idempotencyKey: `order-${order._id}` },
    );

    if (!paymentIntent.client_secret) {
      throw new Error("Missing client secret");
    }

    await attachPaymentIntentToOrder(order._id, paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber: order.orderNumber,
    });
  } catch {
    await releaseReservationUnits(reserveResult.reservationUnits);
    await markOrderStatus(order._id, "failed");
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
