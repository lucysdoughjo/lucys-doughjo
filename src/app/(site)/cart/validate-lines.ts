"use server";

import { sanitizeCartLines } from "@/lib/cart-sanitize";
import {
  validateCartLines,
  type CartValidationResult,
} from "@/lib/cart-validate";
import { getOrderWindowForSite } from "@/sanity/fetch";

export async function validateCartLinesAction(
  lines: unknown,
): Promise<CartValidationResult> {
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
