import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";

export type ProductCardProps = {
  slug?: string;
  name: string;
  priceLabel: string;
  description?: string;
  imageSrc: string;
  imageAlt: string;
  soldOut?: boolean;
  variant?: "default" | "shop";
  showDescription?: boolean;
};

export function ProductCard({
  slug,
  name,
  priceLabel,
  description = "",
  imageSrc,
  imageAlt,
  soldOut = false,
  variant = "default",
  showDescription = true,
}: ProductCardProps) {
  const isShop = variant === "shop";
  const aspectClass = isShop ? "aspect-[4/3]" : "aspect-[4/5]";
  const imageRounded = isShop ? "rounded-md" : "rounded-sm";

  const imageBlock = (
    <div
      className={`relative ${aspectClass} overflow-hidden ${imageRounded} bg-espresso/5`}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover hover:scale-105 transition-transform duration-300"
        unoptimized={imageSrc.startsWith("https://cdn.sanity.io/")}
      />
      {soldOut ? (
        <span className="absolute left-3 top-3 rounded-sm bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
          Sold out
        </span>
      ) : null}
    </div>
  );

  const titleClass = isShop
    ? "font-serif text-lg font-semibold uppercase tracking-wide text-foreground sm:text-xl"
    : "font-serif text-xl font-semibold uppercase tracking-wide text-foreground";

  const priceClass = isShop
    ? "mt-1 text-sm font-semibold text-primary"
    : "mt-1 text-sm font-medium leading-snug text-foreground/80";

  const body = (
    <div className={`flex flex-1 flex-col ${isShop ? "mt-4" : ""}`}>
      <h3 className={isShop ? titleClass : `mt-4 ${titleClass}`}>
        {slug ? (
          <Link href={`/shop/${slug}`} className="hover:text-primary">
            {name}
          </Link>
        ) : (
          name
        )}
      </h3>
      <p className={priceClass}>{priceLabel}</p>
      {showDescription && description ? (
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          {description}
        </p>
      ) : null}
      <div className={isShop ? "mt-auto pt-4" : "mt-4"}>
        {slug ? (
          <Button href={`/shop/${slug}`} variant="primary" className="w-full">
            Order this →
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <article className={`flex flex-col ${isShop ? "h-full" : ""}`}>
      {slug ? (
        <Link
          href={`/shop/${slug}`}
          className="block transition-opacity hover:opacity-90"
        >
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}
      {body}
    </article>
  );
}
