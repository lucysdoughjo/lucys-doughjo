import { CheckoutPageContent } from "@/components/checkout-page-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Checkout",
  description: "Complete your Lucy's Doughjo preorder for Sunday pickup or delivery.",
  path: "/checkout",
  robots: { index: false, follow: false },
});

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}
