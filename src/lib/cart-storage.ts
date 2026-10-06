import { sanitizeCartLines } from "@/lib/cart-sanitize";
import {
  CART_STORAGE_KEY,
  type CartLine,
  lineTotalCents,
} from "@/lib/cart-types";

export function readCartFromStorage(): CartLine[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeCartLines(parsed);
  } catch {
    return [];
  }
}

export function writeCartToStorage(lines: CartLine[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage full or blocked — cart still works for this session.
  }
}

export function sumCartPacks(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.packs, 0);
}

export function sumCartSubtotalCents(lines: CartLine[]) {
  return lines.reduce((total, line) => total + lineTotalCents(line), 0);
}
