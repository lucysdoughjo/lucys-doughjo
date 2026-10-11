import { ProductCard } from "@/components/product-card";
import type { ShopDisplaySection } from "@/lib/shop-sections";

type ShopDisplaySectionProps = {
  section: ShopDisplaySection;
};

export function ShopDisplaySectionBlock({ section }: ShopDisplaySectionProps) {
  return (
    <section id={section.id} className="bg-cream">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="flex items-end gap-4">
          <h2 className="shrink-0 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            {section.title}
          </h2>
          <div className="mb-2 h-px flex-1 bg-primary/60" aria-hidden />
        </div>

        <div className="mt-10 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {section.products.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              priceLabel={product.priceLabel}
              description={product.description}
              imageSrc={product.imageUrl}
              imageAlt={product.imageAlt}
              soldOut={product.soldOut}
              variant="shop"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
