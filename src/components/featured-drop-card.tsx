import Image from "next/image";
import Link from "next/link";
import { ProductCategoryIcon } from "@/components/product-category-icon";

export type FeaturedDropCardProps = {
  slug?: string;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  categorySlug?: string;
  soldOut?: boolean;
  remainingLabel?: string | null;
};

export function FeaturedDropCard({
  slug,
  name,
  description,
  imageSrc,
  imageAlt,
  categorySlug,
  soldOut = false,
  remainingLabel = null,
}: FeaturedDropCardProps) {
  const card = (
    <>
      <div className="relative overflow-hidden bg-espresso/5">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={600}
          height={800}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
          className="h-48 w-full object-cover sm:aspect-3/4 sm:h-auto hover:scale-105 transition-transform duration-300"
          unoptimized={imageSrc.startsWith("https://cdn.sanity.io/")}
        />
        {soldOut ? (
          <span className="absolute left-3 top-3 rounded-sm bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
            Sold out
          </span>
        ) : remainingLabel ? (
          <span className="absolute left-3 top-3 rounded-sm bg-cream/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            {remainingLabel}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col items-center gap-2 lg:gap-3 bg-cream p-3 lg:px-4 lg:py-6 text-center sm:px-5">
        <ProductCategoryIcon categorySlug={categorySlug} />
        <h3 className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-foreground">
          {name}
        </h3>
        <span className="block h-px w-10 bg-primary/70" aria-hidden />
        <p className="text-sm leading-relaxed text-foreground/65">
          {description}
        </p>
      </div>
    </>
  );

  if (slug) {
    return (
      <article className="bg-cream transition-opacity hover:opacity-90">
        <Link
          href={`/shop/${slug}`}
          className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {card}
        </Link>
      </article>
    );
  }

  return <article className="bg-cream">{card}</article>;
}
