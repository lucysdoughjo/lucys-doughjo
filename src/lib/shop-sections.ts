import { shopSectionProductOrder } from "@/lib/shop-catalog";
import type { ShopMenu, ShopProduct } from "@/sanity/shop-types";

export type ShopDisplaySection = {
  id: string;
  title: string;
  products: ShopProduct[];
};

const sectionDefs = [
  {
    id: "artisan-loaves",
    title: "Artisan Loaves",
    orderKey: "artisanLoaves",
    categorySlugs: ["artisan-sourdough"],
  },
  {
    id: "bagels-and-muffins",
    title: "Bagels & English Muffins",
    orderKey: "bagelsAndMuffins",
    categorySlugs: ["bagels", "english-muffins"],
  },
  {
    id: "sweet-treats",
    title: "Sweet Treats",
    orderKey: "sweetTreats",
    categorySlugs: ["cinnamon-rolls", "scones", "jumbo-cookies"],
  },
] as const;

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
  used: Set<string>,
): ShopProduct[] {
  const out: ShopProduct[] = [];
  for (const slug of slugs) {
    const product = bySlug.get(slug);
    if (!product || used.has(product.slug)) continue;
    out.push(product);
    used.add(product.slug);
  }
  return out;
}

function appendByCategory(
  products: ShopProduct[],
  categorySlugs: readonly string[],
  used: Set<string>,
): ShopProduct[] {
  const extras: ShopProduct[] = [];
  for (const product of products) {
    if (used.has(product.slug)) continue;
    if (!categorySlugs.includes(product.categorySlug)) continue;
    extras.push(product);
    used.add(product.slug);
  }
  return extras;
}

export function buildShopDisplaySections(menu: ShopMenu): ShopDisplaySection[] {
  const bySlug = indexProductsBySlug(menu);
  const allProducts = [...bySlug.values()];
  const used = new Set<string>();
  const sections: ShopDisplaySection[] = [];

  for (const def of sectionDefs) {
    const known = pickOrdered(
      bySlug,
      shopSectionProductOrder[def.orderKey] ?? [],
      used,
    );
    const extras = appendByCategory(allProducts, def.categorySlugs, used);
    const products = [...known, ...extras];
    if (products.length === 0) continue;

    sections.push({
      id: def.id,
      title: def.title,
      products,
    });
  }

  const leftover = allProducts.filter((product) => !used.has(product.slug));
  if (leftover.length > 0) {
    sections.push({
      id: "more-this-week",
      title: "More this week",
      products: leftover,
    });
  }

  return sections;
}
