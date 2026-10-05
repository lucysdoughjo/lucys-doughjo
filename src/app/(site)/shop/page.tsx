import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { ShopCategorySection } from "@/components/shop-category-section";
import { getOrderWindowForSite } from "@/sanity/fetch";
import { getShopMenu } from "@/sanity/shop-fetch";

export const metadata: Metadata = {
  title: "Shop · Lucy's Doughjo",
  description:
    "This week's Sunday Dough Drop — preorder small-batch sourdough and baked treats for pickup or delivery.",
};

export default async function ShopPage() {
  const [menu, orderWindow] = await Promise.all([
    getShopMenu(),
    getOrderWindowForSite(),
  ]);

  const productCount = menu.categories.reduce(
    (total, category) => total + category.products.length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Shop"
        title="This week's dough drop"
        description="Small-batch items available for this Sunday's pickup or delivery. Orders close Wednesday at 8 PM Pacific unless we sell out first."
      />

      <p className="mt-6 text-sm text-foreground/80">{orderWindow.label}</p>

      {menu.bakersNote ? (
        <p className="mt-4 max-w-3xl rounded-sm border border-espresso/10 bg-white/40 px-4 py-3 text-sm leading-relaxed text-foreground/80">
          {menu.bakersNote}
        </p>
      ) : null}

      {menu.categories.length > 0 ? (
        <nav
          className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-b border-espresso/10 pb-6"
          aria-label="Menu categories"
        >
          {menu.categories.map((category) => (
            <Link
              key={category.id}
              href={`#${category.slug}`}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/75 hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {productCount === 0 ? (
        <p className="mt-10 rounded-sm border border-espresso/10 bg-white/40 px-4 py-6 text-sm leading-relaxed text-foreground/80">
          The menu for this week hasn&apos;t been posted yet. When Lucy opens
          the drop, items will show up here grouped by category.
        </p>
      ) : null}

      <div className="mt-10 space-y-16">
        {menu.categories.map((category) => (
          <ShopCategorySection key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
