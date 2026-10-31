import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { pageMetadata } from "@/lib/seo";
import { ShopDisplaySectionBlock } from "@/components/shop-display-section";
import { buildShopDisplaySections } from "@/lib/shop-sections";
import { getOrderWindowForSite } from "@/sanity/fetch";
import { getShopMenu } from "@/sanity/shop-fetch";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description:
    "This week's Sunday Dough Drop — preorder small-batch sourdough and baked treats for Sunday pickup or local delivery in Chino, CA.",
  keywords: [
    "Sunday Dough Drop",
    "preorder bakery",
    "sourdough Chino",
    "weekly bakery menu",
  ],
  path: "/shop",
});

export default async function ShopPage() {
  const [menu, orderWindow] = await Promise.all([
    getShopMenu(),
    getOrderWindowForSite(),
  ]);

  const sections = buildShopDisplaySections(menu);
  const hasMenu = sections.length > 0;

  return (
    <>
      <div className="mx-auto max-w-6xl p-4 lg:pt-8 sm:px-6">
        <SectionHeading
          eyebrow="Shop"
          title="This week's dough drop"
          description="Small-batch items available for this Sunday's pickup or delivery. Orders close Wednesday at 8 PM Pacific unless we sell out first."
        />

        <p className="mt-6 text-sm text-foreground/80">{orderWindow.label}</p>

        {!hasMenu ? (
          <p className="mt-10 rounded-sm border border-espresso/10 bg-white/40 px-4 py-6 text-sm leading-relaxed text-foreground/80">
            The menu for this week hasn&apos;t been posted yet. When Lucy opens
            the drop, items will show up here grouped by category.
          </p>
        ) : null}
      </div>

      {hasMenu ? (
        <div className="space-y-0">
          {sections.map((section) => (
            <ShopDisplaySectionBlock key={section.id} section={section} />
          ))}
        </div>
      ) : null}
    </>
  );
}
