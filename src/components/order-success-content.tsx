"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import { OrderSuccessClearCart } from "@/components/order-success-clear-cart";
import { SectionHeading } from "@/components/section-heading";

type OrderStatusResponse = {
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  error?: string;
};

export function OrderSuccessContent({
  paymentIntentId,
  clientSecret,
}: {
  paymentIntentId: string | null;
  clientSecret: string | null;
}) {
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(paymentIntentId && clientSecret));

  useEffect(() => {
    if (!paymentIntentId || !clientSecret) return;

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      const response = await fetch(
        `/api/order/status?payment_intent=${encodeURIComponent(paymentIntentId!)}&payment_intent_client_secret=${encodeURIComponent(clientSecret!)}`,
      );
      const json = (await response.json()) as OrderStatusResponse;
      if (cancelled) return;

      setData(json);
      if (json.status === "paid" || attempts >= 8) {
        setLoading(false);
        return;
      }

      window.setTimeout(poll, 1500);
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [paymentIntentId, clientSecret]);

  if (!paymentIntentId || !clientSecret) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Order"
          title="Missing payment reference"
          description="If you completed payment, check your email for confirmation from Stripe."
        />
        <Button href="/" className="mt-8">
          Back home
        </Button>
      </div>
    );
  }

  const paid = data?.status === "paid";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <OrderSuccessClearCart shouldClear={paid} />
      <SectionHeading
        eyebrow="Thank you"
        title={
          paid
            ? "Your order is confirmed"
            : loading
              ? "Confirming payment…"
              : "Still confirming your order"
        }
        description={
          paid
            ? `Order ${data?.orderNumber ?? ""} is in. You'll get a Stripe receipt and a confirmation email shortly.`
            : loading
              ? "This usually takes a few seconds. Please keep this page open."
              : "We're still waiting on payment confirmation. Check your email or contact us if you were charged."
        }
      />

      {data?.orderNumber ? (
        <dl className="mt-8 max-w-xl space-y-3 text-sm text-foreground/80">
          <div>
            <dt className="font-semibold text-foreground">Order number</dt>
            <dd>{data.orderNumber}</dd>
          </div>
        </dl>
      ) : null}

      {!loading && <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/shop">Shop again</Button>
        <Link
          href="/contact"
          className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70 hover:text-foreground"
        >
          Questions? Contact us
        </Link>
      </div>}
    </div>
  );
}
