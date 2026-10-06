"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { useCart } from "@/components/cart-provider";
import { SectionHeading } from "@/components/section-heading";

export function CheckoutPageContent() {
  const { hydrated, lines } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && lines.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, lines.length, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-foreground/70">Loading checkout…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Checkout"
        title="Almost there"
        description="Guest checkout with pickup or delivery and Stripe payment is coming in the next step. Your cart is saved on this device."
      />
      <Button href="/cart" variant="secondary" className="mt-8">
        ← Back to cart
      </Button>
    </div>
  );
}
