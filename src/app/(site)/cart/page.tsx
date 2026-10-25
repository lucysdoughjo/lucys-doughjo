import { CartPageContent } from "@/components/cart-page-content";
import { pageMetadata } from "@/lib/seo";
import { getOrderWindowForSite } from "@/sanity/fetch";

export const metadata = pageMetadata({
  title: "Cart",
  description: "Review your Sunday Dough Drop preorder at Lucy's Doughjo.",
  path: "/cart",
  robots: { index: false, follow: false },
});

export default async function CartPage() {
  const orderWindow = await getOrderWindowForSite();

  return <CartPageContent orderWindow={orderWindow} />;
}
