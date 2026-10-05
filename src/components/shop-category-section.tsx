import { ProductCard } from "@/components/product-card";
import type { ShopCategory } from "@/sanity/shop-types";

type ShopCategorySectionProps = {
  category: ShopCategory;
};

export function ShopCategorySection({ category }: ShopCategorySectionProps) {
  return (
    <section id={category.slug} className="scroll-mt-28">
      <h2 className="font-serif text-3xl font-semibold text-foreground">
        {category.name}
      </h2>
      {category.blurb ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/75">
          {category.blurb}
        </p>
      ) : null}
      {category.products.length > 0 ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              priceLabel={product.priceLabel}
              description={product.description}
              imageSrc={product.imageUrl}
              imageAlt={product.imageAlt}
              soldOut={product.soldOut}
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-foreground/70">
          Nothing on this week&apos;s drop in this category. Check back when the
          next menu opens.
        </p>
      )}
    </section>
  );
}
