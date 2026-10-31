"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import { OrderSuccessClearCart } from "@/components/order-success-clear-cart";
import { SectionHeading } from "@/components/section-heading";
import { formatPrice } from "@/lib/pricing";

type OrderStatusResponse = {
  orderNumber?: string;
  status?: string;
  fulfillment?: string;
  fulfillmentAddress?: string;
  totalCents?: number;
  error?: string;
};

export function OrderSuccessContent({
  paymentIntentId,
}: {
  paymentIntentId: string | null;
}) {
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(paymentIntentId));

  useEffect(() => {
    if (!paymentIntentId) return;

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      const response = await fetch(
        `/api/order/status?payment_intent=${encodeURIComponent(paymentIntentId!)}`,
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
  }, [paymentIntentId]);

  if (!paymentIntentId) {
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
        title={paid ? "Your order is confirmed" : loading ? "Confirming payment…" : "Payment received"}
        description={
          paid
            ? `Order ${data?.orderNumber ?? ""} is in. You'll get a Stripe receipt and a confirmation email shortly.`
            : "This usually takes a few seconds. Please keep this page open."
        }
      />

      {data?.orderNumber ? (
        <dl className="mt-8 max-w-xl space-y-3 text-sm text-foreground/80">
          <div>
            <dt className="font-semibold text-foreground">Order number</dt>
            <dd>{data.orderNumber}</dd>
          </div>
          {data.fulfillment ? (
            <div>
              <dt className="font-semibold text-foreground">Fulfillment</dt>
              <dd className="capitalize">{data.fulfillment}</dd>
            </div>
          ) : null}
          {data.fulfillmentAddress ? (
            <div>
              <dt className="font-semibold text-foreground">Details</dt>
              <dd className="whitespace-pre-line">{data.fulfillmentAddress}</dd>
            </div>
          ) : null}
          {typeof data.totalCents === "number" ? (
            <div>
              <dt className="font-semibold text-foreground">Total</dt>
              <dd>{formatPrice(data.totalCents)}</dd>
            </div>
          ) : null}
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
