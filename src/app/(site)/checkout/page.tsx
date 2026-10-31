import { CheckoutPageContent } from "@/components/checkout-page-content";
import { Button } from "@/components/button";
import { SectionHeading } from "@/components/section-heading";
import { getNextSundayPacificLabel } from "@/lib/checkout/sunday-label";
import { pageMetadata } from "@/lib/seo";
import {
  getCheckoutOrderWindow,
  getSiteFulfillmentSettings,
} from "@/sanity/checkout-fetch";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Checkout",
  description: "Complete your Lucy's Doughjo preorder for Sunday pickup or delivery.",
  path: "/checkout",
  robots: { index: false, follow: false },
});

export default async function CheckoutPage() {
  const [orderWindow, fulfillmentSettings] = await Promise.all([
    getCheckoutOrderWindow(),
    getSiteFulfillmentSettings(),
  ]);

  if (!orderWindow || !fulfillmentSettings) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Checkout"
          title="Checkout is temporarily unavailable"
          description="We couldn't load this week's pickup and delivery settings. Please try again in a moment."
        />
        <Button href="/cart" variant="secondary" className="mt-8">
          ← Back to cart
        </Button>
      </div>
    );
  }

  return (
    <CheckoutPageContent
      orderWindow={orderWindow}
      fulfillmentSettings={fulfillmentSettings}
      sundayLabel={getNextSundayPacificLabel()}
    />
  );
}
