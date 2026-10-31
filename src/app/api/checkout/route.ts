import { NextResponse } from "next/server";
import { sanitizeCartLines } from "@/lib/cart-sanitize";
import { buildCheckoutQuote } from "@/lib/checkout/prepare-checkout";
import type { QuoteCustomerInput } from "@/lib/checkout/quote-order";
import {
  attachPaymentIntentToOrder,
  createPendingOrder,
  releasePendingOrder,
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
  if (await isCheckoutRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  if (!isSanityWriteConfigured()) {
    console.error("Checkout unavailable: Sanity write token is not configured.");
    return NextResponse.json(
      { error: "Checkout is unavailable right now." },
      { status: 503 },
    );
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    console.error("Checkout unavailable: Stripe is not configured.");
    return NextResponse.json(
      { error: "Checkout is unavailable right now." },
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

  const cartLines = sanitizeCartLines(body.lines);
  if (cartLines.length === 0) {
    return NextResponse.json(
      { error: "Your cart is empty.", code: "empty_cart" },
      { status: 400 },
    );
  }

  const quoteResult = await buildCheckoutQuote({
    cartLines,
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
    await releaseReservationUnits(reserveResult.reservationUnits, {
      currentWeekStart: quote.weekStart,
      orderWeekStart: quote.weekStart,
    });
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 },
    );
  }

  const description = quote.lines
    .map((line) => `${line.name} — ${line.optionLabel} × ${line.packs}`)
    .join("; ")
    .slice(0, 500);

  let paymentIntentId: string | null = null;

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: quote.totalCents,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
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
    paymentIntentId = paymentIntent.id;

    if (!paymentIntent.client_secret) {
      throw new Error("Missing client secret");
    }

    await attachPaymentIntentToOrder(order._id, paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber: order.orderNumber,
      subtotalCents: quote.subtotalCents,
      deliveryFeeCents: quote.deliveryFeeCents,
      totalCents: quote.totalCents,
      lines: quote.lines.map((line) => ({
        productId: line.productId,
        optionId: line.optionId,
        name: line.name,
        optionLabel: line.optionLabel,
        packs: line.packs,
        lineTotalCents: line.lineTotalCents,
      })),
    });
  } catch {
    if (paymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(paymentIntentId);
      } catch {
        // PaymentIntent may already be uncancelable.
      }
    }
    await releasePendingOrder(order, "failed");
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
