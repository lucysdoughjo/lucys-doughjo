import { shopSectionProductOrder } from "@/lib/shop-catalog";
import type { ShopMenu, ShopProduct } from "@/sanity/shop-types";

export type ShopDisplaySection = {
  id: string;
  title: string;
  products: ShopProduct[];
};

function indexProductsBySlug(menu: ShopMenu): Map<string, ShopProduct> {
  const map = new Map<string, ShopProduct>();
  for (const category of menu.categories) {
    for (const product of category.products) {
      map.set(product.slug, product);
    }
  }
  return map;
}

function pickOrdered(
  bySlug: Map<string, ShopProduct>,
  slugs: string[],
): ShopProduct[] {
  const out: ShopProduct[] = [];
  for (const slug of slugs) {
    const product = bySlug.get(slug);
    if (product) out.push(product);
  }
  return out;
}

export function buildShopDisplaySections(menu: ShopMenu): ShopDisplaySection[] {
  const bySlug = indexProductsBySlug(menu);

  const artisanLoaves = pickOrdered(
    bySlug,
    shopSectionProductOrder.artisanLoaves,
  );
  const bagelsAndMuffins = pickOrdered(
    bySlug,
    shopSectionProductOrder.bagelsAndMuffins,
  );
  const sweetTreats = pickOrdered(
    bySlug,
    shopSectionProductOrder.sweetTreats,
  );

  const sections: ShopDisplaySection[] = [];

  if (artisanLoaves.length > 0) {
    sections.push({
      id: "artisan-loaves",
      title: "Artisan Loaves",
      products: artisanLoaves,
    });
  }

  if (bagelsAndMuffins.length > 0) {
    sections.push({
      id: "bagels-and-muffins",
      title: "Bagels & English Muffins",
      products: bagelsAndMuffins,
    });
  }

  if (sweetTreats.length > 0) {
    sections.push({
      id: "sweet-treats",
      title: "Sweet Treats",
      products: sweetTreats,
    });
  }

  return sections;
}
