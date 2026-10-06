import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailForm } from "@/components/product-detail-form";
import { ProductGallery } from "@/components/product-gallery";
import { getOrderWindowForSite } from "@/sanity/fetch";
import { getAllProductSlugs, getProductBySlug } from "@/sanity/shop-fetch";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found · Lucy's Doughjo" };
  }

  return {
    title: `${product.name} · Lucy's Doughjo`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, orderWindow] = await Promise.all([
    getProductBySlug(slug),
    getOrderWindowForSite(),
  ]);

  if (!product || !product.availableThisWeek) {
    notFound();
  }

  const orderingDisabled = !orderWindow.isOpen;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/shop"
        className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70 hover:text-foreground"
      >
        ← Back to menu
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.gallery} productName={product.name} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">
            {product.categoryName}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold uppercase tracking-wide text-foreground">
            {product.name}
          </h1>
          <p className="mt-3 text-lg font-medium text-foreground/85">
            {product.priceLabel}
          </p>
          <p className="mt-5 text-base leading-relaxed text-foreground/80">
            {product.description}
          </p>

          {product.allergens ? (
            <p className="mt-4 text-sm text-foreground/70">
              <span className="font-semibold text-foreground">Allergens: </span>
              {product.allergens}
            </p>
          ) : null}

          <p className="mt-4 text-sm text-foreground/70">{orderWindow.label}</p>

          <ProductDetailForm
            productId={product.id}
            slug={product.slug}
            productName={product.name}
            imageUrl={product.imageUrl}
            purchaseOptions={product.purchaseOptions}
            soldOut={product.soldOut}
            orderingDisabled={orderingDisabled}
          />
        </div>
      </div>
    </div>
  );
}
