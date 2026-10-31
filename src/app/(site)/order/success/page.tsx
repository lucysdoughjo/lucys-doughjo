import { OrderSuccessContent } from "@/components/order-success-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: "Order confirmed",
    description: "Thank you for your Lucy's Doughjo preorder.",
    path: "/order/success",
    robots: { index: false, follow: false },
  }),
  referrer: "no-referrer" as const,
};

type SuccessPageProps = {
  searchParams: Promise<{
    payment_intent?: string;
    payment_intent_client_secret?: string;
  }>;
};

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const paymentIntentId = params.payment_intent?.trim() ?? null;
  const clientSecret = params.payment_intent_client_secret?.trim() ?? null;

  return (
    <OrderSuccessContent
      paymentIntentId={paymentIntentId}
      clientSecret={clientSecret}
    />
  );
}
