import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";
import { DoughDropSteps } from "@/components/dough-drop-steps";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import {
  getFeaturedProducts,
  getHomePageContent,
  getUpcomingEvents,
} from "@/sanity/fetch";

function isSanityImageUrl(src: string) {
  return src.startsWith("https://cdn.sanity.io/");
}

export default async function HomePage() {
  const [content, products, events] = await Promise.all([
    getHomePageContent(),
    getFeaturedProducts(),
    getUpcomingEvents(),
  ]);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
        <div>
          <h1 className="whitespace-pre-line font-serif text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-[2.75rem]">
            {content.heroHeadline}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/80">
            {content.heroBody}
          </p>
          <Button href="/shop" className="mt-8">
            Shop this week&apos;s drop →
          </Button>
        </div>
        <div className="relative">
          <p className="mb-3 text-right font-script text-2xl text-primary sm:text-3xl">
            {content.scriptAccent}
          </p>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-espresso/5 lg:aspect-[5/4]">
            <Image
              src={content.heroImageUrl}
              alt={content.heroImageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              unoptimized={isSanityImageUrl(content.heroImageUrl)}
            />
          </div>
        </div>
      </section>

      <DoughDropSteps />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="This week"
            title="This week's drop"
            description={content.dropSectionDescription}
          />
          <Link
            href="/shop"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground underline-offset-4 hover:underline"
          >
            View full menu →
          </Link>
        </div>
        {/* {content.bakersNote ? (
          <p className="mt-6 max-w-2xl rounded-sm border border-espresso/10 bg-white/40 px-4 py-3 text-sm leading-relaxed text-foreground/80">
            {content.bakersNote}
          </p>
        ) : null} */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug || undefined}
              name={product.name}
              priceLabel={product.priceLabel}
              description={product.description}
              imageSrc={product.imageUrl}
              imageAlt={product.imageAlt}
              soldOut={product.soldOut}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-espresso/10 bg-highlight/15">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-espresso/5">
              <Image
                src={content.storyImageUrl}
                alt={content.storyImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                unoptimized={isSanityImageUrl(content.storyImageUrl)}
              />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <SectionHeading
              eyebrow="Our story"
              title={content.storyTitle}
              description={content.storyTeaser}
            />
            <Button href="/about" variant="primary" className="mt-6 w-fit">
              Learn more →
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <SectionHeading
          eyebrow="Find us"
          title="Find Lucy's Doughjo"
          description={content.findUsIntro}
        />
        <ul className="mt-8 space-y-4 text-sm text-foreground/80">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-1 border-b border-espresso/10 pb-4 sm:flex-row sm:gap-3"
            >
              <span className="shrink-0 font-semibold text-foreground">
                {event.label}
              </span>
              <span>{event.summary}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/find-us"
          className="mt-6 inline-block text-xs font-semibold uppercase tracking-[0.12em] underline-offset-4 hover:underline"
        >
          See where we&apos;ll be →
        </Link>
      </section>
    </>
  );
}
