import { OrderSuccessContent } from "@/components/order-success-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Order confirmed",
  description: "Thank you for your Lucy's Doughjo preorder.",
  path: "/order/success",
  robots: { index: false, follow: false },
});

type SuccessPageProps = {
  searchParams: Promise<{ payment_intent?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const paymentIntentId = params.payment_intent?.trim() ?? null;

  return <OrderSuccessContent paymentIntentId={paymentIntentId} />;
}
