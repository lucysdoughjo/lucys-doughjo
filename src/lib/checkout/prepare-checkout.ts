import { getOrderWindowForSite } from "@/sanity/fetch";
import {
  getCheckoutProductsBySlugs,
  getCurrentDropWeekStart,
  getSiteFulfillmentSettings,
} from "@/sanity/checkout-fetch";
import { sanitizeCartLines } from "@/lib/cart-sanitize";
import {
  quoteOrder,
  type QuoteCustomerInput,
  type QuoteResult,
} from "@/lib/checkout/quote-order";

export async function buildCheckoutQuote(input: {
  cartLines: unknown;
  customer: QuoteCustomerInput;
}): Promise<QuoteResult> {
  const lines = sanitizeCartLines(input.cartLines);
  const slugs = lines.map((line) => line.slug);

  const [productsBySlug, fulfillmentSettings, orderWindow, weekStart] =
    await Promise.all([
      getCheckoutProductsBySlugs(slugs),
      getSiteFulfillmentSettings(),
      getOrderWindowForSite(),
      getCurrentDropWeekStart(),
    ]);

  if (slugs.length > 0 && productsBySlug.size === 0) {
    return {
      ok: false,
      code: "catalog_unavailable",
      message:
        "We couldn't load the menu for checkout. Please try again in a moment.",
    };
  }

  return quoteOrder({
    cartLines: lines,
    customer: input.customer,
    fulfillmentSettings,
    productsBySlug,
    orderWindow,
    weekStart,
  });
}
