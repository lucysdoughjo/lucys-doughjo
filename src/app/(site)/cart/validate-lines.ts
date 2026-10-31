"use server";

import { headers } from "next/headers";
import { sanitizeCartLines } from "@/lib/cart-sanitize";
import {
  validateCartLines,
  type CartValidationResult,
} from "@/lib/cart-validate";
import {
  clientIpFromHeaders,
  isCartRateLimited,
} from "@/lib/checkout/rate-limit";
import { getOrderWindowForSite } from "@/sanity/fetch";

export async function validateCartLinesAction(
  lines: unknown,
): Promise<CartValidationResult> {
  const ip = clientIpFromHeaders(await headers());
  if (isCartRateLimited(ip)) {
    return {
      ok: false,
      error: "Too many cart checks. Please wait a minute and try again.",
    };
  }

  const sanitized = sanitizeCartLines(lines);
  if (sanitized.length === 0) {
    return {
      ok: true,
      lines: [],
      orderWindow: await getOrderWindowForSite(),
    };
  }

  return validateCartLines(sanitized);
}
