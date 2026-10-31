"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutPaymentForm } from "@/components/checkout-payment-form";
import { Button } from "@/components/button";
import { useCart } from "@/components/cart-provider";
import { SectionHeading } from "@/components/section-heading";
import { formatPrice } from "@/lib/pricing";
import type { OrderWindowState } from "@/lib/order-window";
import type { SiteFulfillmentSettings } from "@/sanity/checkout-fetch";
import { normalizeUsPhone } from "@/lib/checkout/phone";
import type { FulfillmentMethod } from "@/lib/checkout/quote-order";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type CheckoutPageContentProps = {
  orderWindow: OrderWindowState;
  fulfillmentSettings: SiteFulfillmentSettings;
  sundayLabel: string;
};

export function CheckoutPageContent({
  orderWindow,
  fulfillmentSettings,
  sundayLabel,
}: CheckoutPageContentProps) {
  const { hydrated, lines, subtotalCents } = useCart();
  const router = useRouter();

  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("pickup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryZip, setDeliveryZip] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [startingPayment, setStartingPayment] = useState(false);
  const startingRef = useRef(false);
  const [quoted, setQuoted] = useState<{
    subtotalCents: number;
    deliveryFeeCents: number;
    totalCents: number;
    lines: Array<{
      productId: string;
      optionId: string;
      name: string;
      optionLabel: string;
      packs: number;
      lineTotalCents: number;
    }>;
  } | null>(null);

  useEffect(() => {
    if (hydrated && lines.length === 0 && !clientSecret) {
      router.replace("/cart");
    }
  }, [hydrated, lines.length, router, clientSecret]);

  const deliveryFeeCents =
    quoted?.deliveryFeeCents ??
    (fulfillment === "delivery" ? fulfillmentSettings.deliveryFeeCents : 0);
  const displaySubtotalCents = quoted?.subtotalCents ?? subtotalCents;
  const totalCents = quoted?.totalCents ?? displaySubtotalCents + deliveryFeeCents;
  const summaryLines = quoted?.lines ?? lines;

  const returnUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "/order/success";
    }
    return `${window.location.origin}/order/success`;
  }, []);

  async function handleContinueToPayment(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const formattedPhone = normalizeUsPhone(phone);
    if (!formattedPhone) {
      setFormError("Please enter a valid 10-digit phone number e.g. (909) 555-0100");
      return;
    }

    if (startingRef.current) return;
    startingRef.current = true;
    setStartingPayment(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customer: {
            name,
            email,
            phone: formattedPhone,
            fulfillment,
            deliveryStreet,
            deliveryCity,
            deliveryZip,
            orderNotes: orderNotes || null,
          },
        }),
      });

      const data = (await response.json()) as {
        clientSecret?: string;
        orderNumber?: string;
        error?: string;
        subtotalCents?: number;
        deliveryFeeCents?: number;
        totalCents?: number;
        lines?: Array<{
          productId: string;
          optionId: string;
          name: string;
          optionLabel: string;
          packs: number;
          lineTotalCents: number;
        }>;
      };

      if (!response.ok || !data.clientSecret || !data.orderNumber) {
        setFormError(data.error ?? "Could not start checkout. Please try again.");
        startingRef.current = false;
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderNumber(data.orderNumber);
      if (
        typeof data.subtotalCents === "number" &&
        typeof data.deliveryFeeCents === "number" &&
        typeof data.totalCents === "number" &&
        Array.isArray(data.lines)
      ) {
        setQuoted({
          subtotalCents: data.subtotalCents,
          deliveryFeeCents: data.deliveryFeeCents,
          totalCents: data.totalCents,
          lines: data.lines,
        });
      }
    } catch {
      setFormError("Network error. Please try again.");
      startingRef.current = false;
    } finally {
      setStartingPayment(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-foreground/70">Loading checkout…</p>
      </div>
    );
  }

  if (!orderWindow.isOpen) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Checkout"
          title="Orders are closed"
          description={orderWindow.label}
        />
        <Button href="/cart" variant="secondary" className="mt-8">
          ← Back to cart
        </Button>
      </div>
    );
  }

  if (lines.length === 0 && !clientSecret) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Checkout"
        title="Sunday Dough Drop"
        description={`Fulfillment on ${sundayLabel}.`}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(0,360px)]">
        <div>
          {!clientSecret ? (
            <form onSubmit={handleContinueToPayment} className="space-y-6">
              {formError ? (
                <p className="rounded-sm border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                  {formError}
                </p>
              ) : null}

              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
                  Contact
                </legend>
                <div className="mt-3 space-y-4">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-sm border border-espresso/15 bg-white px-4 py-3 text-sm"
                    autoComplete="name"
                  />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-sm border border-espresso/15 bg-white px-4 py-3 text-sm"
                    autoComplete="email"
                  />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full rounded-sm border border-espresso/15 bg-white px-4 py-3 text-sm"
                    autoComplete="tel"
                  />
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
                  Fulfillment
                </legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {(["pickup", "delivery"] as const).map((method) => (
                    <label
                      key={method}
                      className="flex cursor-pointer items-center gap-2 rounded-sm border border-espresso/15 px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <input
                        type="radio"
                        name="fulfillment"
                        checked={fulfillment === method}
                        onChange={() => setFulfillment(method)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {fulfillment === "pickup" ? (
                <div className="rounded-sm border border-espresso/10 bg-highlight/10 px-4 py-4 text-sm leading-relaxed text-foreground/80">
                  <p className="font-semibold text-foreground">Pickup</p>
                  <p className="mt-2">{fulfillmentSettings.pickupAddress}</p>
                  {fulfillmentSettings.pickupInstructions ? (
                    <p className="mt-2 text-foreground/70">
                      {fulfillmentSettings.pickupInstructions}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    required
                    value={deliveryStreet}
                    onChange={(e) => setDeliveryStreet(e.target.value)}
                    placeholder="Street address"
                    className="w-full rounded-sm border border-espresso/15 bg-white px-4 py-3 text-sm"
                    autoComplete="street-address"
                  />
                  <input
                    required
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="City"
                    className="w-full rounded-sm border border-espresso/15 bg-white px-4 py-3 text-sm"
                    autoComplete="address-level2"
                  />
                  <div className="relative">
                    <select
                      required
                      value={deliveryZip}
                      onChange={(e) => setDeliveryZip(e.target.value)}
                      className={`w-full appearance-none rounded-sm border border-espresso/15 bg-white px-4 py-3 pr-10 text-sm text-foreground outline-none ring-primary/30 transition-shadow focus:ring-2 ${
                        deliveryZip ? "text-foreground" : "text-foreground/50"
                      }`}
                      autoComplete="postal-code"
                    >
                      <option value="" disabled>
                        Select ZIP code
                      </option>
                      {fulfillmentSettings.deliveryZipCodes.map((zip) => (
                        <option key={zip} value={zip} className="bg-white text-foreground">
                          {zip}
                        </option>
                      ))}
                    </select>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/60"
                      aria-hidden="true"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19 9-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {fulfillmentSettings.deliveryNotes ? (
                    <p className="text-xs text-foreground/60">
                      {fulfillmentSettings.deliveryNotes}
                    </p>
                  ) : null}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
                  Note (optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-y rounded-sm border border-espresso/15 bg-white px-4 py-3 text-sm"
                  placeholder="Gate code, allergy reminder, etc."
                />
              </div>

              <Button type="submit" disabled={startingPayment || !stripePromise}>
                {startingPayment ? "Preparing payment…" : "Continue to payment →"}
              </Button>
            </form>
          ) : stripePromise && clientSecret && orderNumber ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutPaymentForm orderNumber={orderNumber} returnUrl={returnUrl} />
            </Elements>
          ) : null}
        </div>

        <aside className="rounded-sm border border-espresso/10 bg-highlight/10 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
            Order summary
          </h2>
          <ul className="mt-4 space-y-4">
            {summaryLines.map((line) => (
              <li key={`${line.productId}-${line.optionId}`} className="text-sm">
                <p className="font-medium text-foreground text-base">{line.name}</p>
                <p className="text-foreground/70 text-base">
                  {line.optionLabel}
                  {line.packs > 1 ? ` × ${line.packs}` : ""}
                </p>
                <p className="mt-1 font-medium text-base">
                  {formatPrice(
                    "lineTotalCents" in line
                      ? line.lineTotalCents
                      : line.tierPriceCents * line.packs,
                  )}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-espresso/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground/70">Subtotal</dt>
              <dd className="text-lg">{formatPrice(displaySubtotalCents)}</dd>
            </div>
            {deliveryFeeCents > 0 ? (
              <div className="flex justify-between">
                <dt className="text-foreground/70">Delivery</dt>
                <dd className="text-lg">{formatPrice(deliveryFeeCents)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between font-semibold text-foreground">
              <dt className="text-lg">Total</dt>
              <dd className="text-2xl">{formatPrice(totalCents)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
