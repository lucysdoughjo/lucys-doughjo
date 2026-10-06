"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cartCatalogFieldsEqual,
  cartLinesEqual,
  mergeValidatedCatalogFields,
  sanitizeCartLine,
  sanitizeCartLines,
} from "@/lib/cart-sanitize";
import {
  readCartFromStorage,
  sumCartPacks,
  sumCartSubtotalCents,
  writeCartToStorage,
} from "@/lib/cart-storage";
import { CART_STORAGE_KEY, cartLineKey, type CartLine } from "@/lib/cart-types";
import type { ValidatedCartLine } from "@/lib/cart-validate";

type AddCartLineInput = Omit<CartLine, "packs"> & { packs?: number };

type CartContextValue = {
  hydrated: boolean;
  lines: CartLine[];
  totalPacks: number;
  subtotalCents: number;
  addLine: (input: AddCartLineInput) => void;
  setLinePacks: (productId: string, optionId: string, packs: number) => void;
  removeLine: (productId: string, optionId: string) => void;
  clearCart: () => void;
  applyValidatedLines: (validated: ValidatedCartLine[]) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function mergeLine(existing: CartLine, incoming: CartLine): CartLine {
  return {
    ...existing,
    name: incoming.name,
    slug: incoming.slug,
    imageUrl: incoming.imageUrl,
    optionLabel: incoming.optionLabel,
    tierQuantity: incoming.tierQuantity,
    tierPriceCents: incoming.tierPriceCents,
    optionId: incoming.optionId,
    packs: Math.min(99, existing.packs + incoming.packs),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate guest cart from localStorage once on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration
    setLines(readCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCartToStorage(lines);
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    function onStorage(event: StorageEvent) {
      if (event.key !== CART_STORAGE_KEY || event.storageArea !== localStorage) {
        return;
      }
      setLines(readCartFromStorage());
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrated]);

  const addLine = useCallback((input: AddCartLineInput) => {
    const incoming = sanitizeCartLine({ ...input, packs: input.packs ?? 1 });
    if (!incoming) return;

    setLines((current) => {
      const key = cartLineKey(incoming);
      const index = current.findIndex((line) => cartLineKey(line) === key);
      let next: CartLine[];
      if (index === -1) {
        next = [...current, incoming];
      } else {
        next = [...current];
        next[index] = mergeLine(current[index], incoming);
      }
      return sanitizeCartLines(next);
    });
  }, []);

  const setLinePacks = useCallback(
    (productId: string, optionId: string, packs: number) => {
      const safePacks = Math.min(
        99,
        Math.max(1, Math.floor(Number.isFinite(packs) ? packs : 1)),
      );
      setLines((current) =>
        sanitizeCartLines(
          current.map((line) =>
            line.productId === productId && line.optionId === optionId
              ? { ...line, packs: safePacks }
              : line,
          ),
        ),
      );
    },
    [],
  );

  const removeLine = useCallback((productId: string, optionId: string) => {
    setLines((current) =>
      current.filter(
        (line) =>
          !(line.productId === productId && line.optionId === optionId),
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const applyValidatedLines = useCallback((validated: ValidatedCartLine[]) => {
    const catalogLines = validated.map((line) => ({
      productId: line.productId,
      slug: line.slug,
      name: line.name,
      imageUrl: line.imageUrl,
      optionId: line.optionId,
      optionLabel: line.optionLabel,
      tierQuantity: line.tierQuantity,
      tierPriceCents: line.tierPriceCents,
      packs: line.packs,
    }));

    setLines((current) => {
      const merged = mergeValidatedCatalogFields(current, catalogLines);
      const sanitized = sanitizeCartLines(merged);
      if (cartLinesEqual(current, sanitized)) {
        return current;
      }
      return sanitized;
    });
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      lines,
      totalPacks: sumCartPacks(lines),
      subtotalCents: sumCartSubtotalCents(lines),
      addLine,
      setLinePacks,
      removeLine,
      clearCart,
      applyValidatedLines,
    }),
    [
      hydrated,
      lines,
      addLine,
      setLinePacks,
      removeLine,
      clearCart,
      applyValidatedLines,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export function validatedCatalogDiffersFromCart(
  current: CartLine[],
  validated: ValidatedCartLine[],
): boolean {
  for (const vline of validated) {
    const existing = current.find(
      (line) =>
        line.slug === vline.slug && line.tierQuantity === vline.tierQuantity,
    );
    if (!existing) return true;
    if (!cartCatalogFieldsEqual(existing, vline)) return true;
  }
  return false;
}
