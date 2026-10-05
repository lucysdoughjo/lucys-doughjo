import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";

export type ProductCardProps = {
  slug?: string;
  name: string;
  priceLabel: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  soldOut?: boolean;
};

export function ProductCard({
  slug,
  name,
  priceLabel,
  description,
  imageSrc,
  imageAlt,
  soldOut = false,
}: ProductCardProps) {
  const imageBlock = (
    <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-espresso/5">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover"
        unoptimized={imageSrc.startsWith("https://cdn.sanity.io/")}
      />
      {soldOut ? (
        <span className="absolute left-3 top-3 rounded-sm bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
          Sold out
        </span>
      ) : null}
    </div>
  );

  return (
    <article className="flex flex-col">
      {slug ? (
        <Link href={`/shop/${slug}`} className="block transition-opacity hover:opacity-90">
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}
      <h3 className="mt-4 font-serif text-xl font-semibold uppercase tracking-wide text-foreground">
        {slug ? (
          <Link href={`/shop/${slug}`} className="hover:underline">
            {name}
          </Link>
        ) : (
          name
        )}
      </h3>
      <p className="mt-1 text-sm font-medium leading-snug text-foreground/80">
        {priceLabel}
      </p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">
        {description}
      </p>
      {slug ? (
        <Button href={`/shop/${slug}`} variant="primary" className="mt-4 w-full">
          Order this →
        </Button>
      ) : null}
    </article>
  );
}
