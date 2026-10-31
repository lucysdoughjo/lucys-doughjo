import { CartPageContent } from "@/components/cart-page-content";
import { toCartCatalogProduct } from "@/lib/cart-validate";
import { pageMetadata } from "@/lib/seo";
import { getOrderWindowForSite } from "@/sanity/fetch";
import { getShopMenu } from "@/sanity/shop-fetch";

export const metadata = pageMetadata({
  title: "Cart",
  description: "Review your Sunday Dough Drop preorder at Lucy's Doughjo.",
  path: "/cart",
  robots: { index: false, follow: false },
});

export default async function CartPage() {
  const [orderWindow, menu] = await Promise.all([
    getOrderWindowForSite(),
    getShopMenu(),
  ]);

  const catalog = menu.categories.flatMap((category) =>
    category.products.map(toCartCatalogProduct),
  );

  return <CartPageContent orderWindow={orderWindow} catalog={catalog} />;
}
