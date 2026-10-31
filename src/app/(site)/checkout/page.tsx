import { CheckoutPageContent } from "@/components/checkout-page-content";
import { getNextSundayPacificLabel } from "@/lib/checkout/sunday-label";
import { pageMetadata } from "@/lib/seo";
import { getSiteFulfillmentSettings } from "@/sanity/checkout-fetch";
import { getOrderWindowForSite } from "@/sanity/fetch";

export const metadata = pageMetadata({
  title: "Checkout",
  description: "Complete your Lucy's Doughjo preorder for Sunday pickup or delivery.",
  path: "/checkout",
  robots: { index: false, follow: false },
});

export default async function CheckoutPage() {
  const [orderWindow, fulfillmentSettings] = await Promise.all([
    getOrderWindowForSite(),
    getSiteFulfillmentSettings(),
  ]);

  return (
    <CheckoutPageContent
      orderWindow={orderWindow}
      fulfillmentSettings={fulfillmentSettings}
      sundayLabel={getNextSundayPacificLabel()}
    />
  );
}
