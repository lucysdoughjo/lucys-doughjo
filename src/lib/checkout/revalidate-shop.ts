import { revalidatePath } from "next/cache";

export function revalidateShopAfterInventory(slugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/shop");
  for (const slug of slugs) {
    if (slug) {
      revalidatePath(`/shop/${slug}`);
    }
  }
}
