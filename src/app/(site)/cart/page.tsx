import { CartPageContent } from "@/components/cart-page-content";
import { getOrderWindowForSite } from "@/sanity/fetch";

export const metadata = {
  title: "Cart",
};

export default async function CartPage() {
  const orderWindow = await getOrderWindowForSite();

  return <CartPageContent orderWindow={orderWindow} />;
}
