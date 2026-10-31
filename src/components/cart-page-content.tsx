"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { validateCartLinesAction } from "@/app/(site)/cart/validate-lines";
import { Button } from "@/components/button";
import {
  validatedCatalogDiffersFromCart,
  useCart,
} from "@/components/cart-provider";
import { SectionHeading } from "@/components/section-heading";
import {
  cartHasCheckoutBlockers,
  validateCartLinesWithProducts,
  type CartCatalogProduct,
  type ValidatedCartLine,
} from "@/lib/cart-validate";
import type { CartLine } from "@/lib/cart-types";
import {
  computeLineTotalCents,
  formatPrice,
  unitsFromLine,
} from "@/lib/pricing";
import type { OrderWindowState } from "@/lib/order-window";

type CartPageContentProps = {
  orderWindow: OrderWindowState;
  catalog: CartCatalogProduct[];
};

const VALIDATION_DEBOUNCE_MS = 250;

function isSanityCdn(url: string) {
  return url.startsWith("https://cdn.sanity.io/");
}

function findValidationForLine(
  line: { slug: string; tierQuantity: number; productId: string; optionId: string },
  validated: ValidatedCartLine[] | null,
): ValidatedCartLine | null {
  if (!validated) return null;
  return (
    validated.find(
      (entry) =>
        entry.slug === line.slug && entry.tierQuantity === line.tierQuantity,
    ) ??
    validated.find(
      (entry) =>
        entry.productId === line.productId && entry.optionId === line.optionId,
    ) ??
    null
  );
}

function liveValidationMatchesCart(
  live: ValidatedCartLine[],
  lines: CartLine[],
): boolean {
  if (live.length !== lines.length) return false;
  return lines.every((line) =>
    live.some(
      (entry) =>
        entry.slug === line.slug &&
        entry.tierQuantity === line.tierQuantity &&
        entry.packs === line.packs,
    ),
  );
}

export function CartPageContent({
  orderWindow,
  catalog,
}: CartPageContentProps) {
  const {
    hydrated,
    lines,
    subtotalCents,
    setLinePacks,
    removeLine,
    applyValidatedLines,
  } = useCart();
  const [liveValidated, setLiveValidated] = useState<ValidatedCartLine[] | null>(
    null,
  );
  const [liveOrderWindow, setLiveOrderWindow] =
    useState<OrderWindowState | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [priceNotice, setPriceNotice] = useState(false);
  const requestRef = useRef(0);
  const isFirstValidation = useRef(true);

  const catalogBySlug = useMemo(() => {
    const map = new Map<string, CartCatalogProduct>();
    for (const product of catalog) {
      map.set(product.slug, product);
    }
    return map;
  }, [catalog]);

  const catalogValidated = useMemo(
    () => validateCartLinesWithProducts(lines, catalogBySlug),
    [lines, catalogBySlug],
  );

  const validated =
    liveValidated && liveValidationMatchesCart(liveValidated, lines)
      ? liveValidated
      : catalogValidated;

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;
    if (!validatedCatalogDiffersFromCart(lines, catalogValidated)) return;

    applyValidatedLines(catalogValidated);
    if (catalogValidated.some((line) => line.priceChanged)) {
      setPriceNotice(true);
    }
  }, [hydrated, lines, catalogValidated, applyValidatedLines]);

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;

    const requestId = ++requestRef.current;
    const delay = isFirstValidation.current ? 0 : VALIDATION_DEBOUNCE_MS;

    const timer = window.setTimeout(async () => {
      isFirstValidation.current = false;
      const result = await validateCartLinesAction(lines);
      if (requestId !== requestRef.current) return;

      if (!result.ok) {
        setValidationError(result.error);
        return;
      }

      setValidationError(null);
      setLiveOrderWindow(result.orderWindow);
      setLiveValidated(result.lines);
      if (result.lines.some((line) => line.priceChanged)) {
        setPriceNotice(true);
      }

      if (validatedCatalogDiffersFromCart(lines, result.lines)) {
        applyValidatedLines(result.lines);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [hydrated, lines, applyValidatedLines]);

  const effectiveOrderWindow = liveOrderWindow ?? orderWindow;
  const hasBlockers = cartHasCheckoutBlockers(validated);

  const canCheckout =
    effectiveOrderWindow.isOpen &&
    lines.length > 0 &&
    hydrated &&
    !hasBlockers;

  const checkoutHint = useMemo(() => {
    if (lines.length === 0) return null;
    if (validationError) return validationError;
    if (!effectiveOrderWindow.isOpen) return effectiveOrderWindow.label;
    if (hasBlockers) {
      return "Remove sold-out or unavailable items before checkout.";
    }
    if (priceNotice) {
      return "Prices were refreshed from this week's menu.";
    }
    return null;
  }, [
    lines.length,
    effectiveOrderWindow,
    hasBlockers,
    priceNotice,
    validationError,
  ]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-foreground/70">Loading your cart…</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Cart"
          title="This week's drop is waiting"
          description="Your cart is empty. Browse the menu and add a pack while ordering is open."
        />
        <Button href="/shop" className="mt-8">
          Shop this week&apos;s drop →
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SectionHeading
        eyebrow="Cart"
        title="Your order"
        description="Pack quantities match what you chose on each product page, not individual pieces."
      />

      {checkoutHint ? (
        <p
          className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/75"
          role="status"
        >
          {checkoutHint}
        </p>
      ) : null}

      <ul className="mt-10 divide-y divide-espresso/10 border-y border-espresso/10">
        {lines.map((line) => {
          const total = computeLineTotalCents(line.tierPriceCents, line.packs);
          const units = unitsFromLine(line.tierQuantity, line.packs);
          const validation = findValidationForLine(line, validated);

          return (
            <li
              key={`${line.productId}-${line.optionId}`}
              className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center"
            >
              <Link
                href={`/shop/${line.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-espresso/5"
              >
                <Image
                  src={line.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={isSanityCdn(line.imageUrl)}
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/shop/${line.slug}`}
                  className="font-serif text-lg font-semibold uppercase tracking-wide text-foreground hover:underline"
                >
                  {line.name}
                </Link>
                <p className="mt-1 text-sm text-foreground/75">
                  {line.optionLabel}
                  {line.packs > 1 ? ` × ${line.packs}` : null}
                </p>
                <p className="mt-1 text-xs text-foreground/55">
                  {units} {units === 1 ? "item" : "items"} for this drop
                </p>
                {validation?.soldOut || validation?.unavailable ? (
                  <p className="mt-2 text-sm font-medium text-accent">
                    {validation.unavailable
                      ? "No longer available this week"
                      : "Sold out — remove to continue"}
                  </p>
                ) : null}
                {validation?.priceChanged &&
                !validation.unavailable &&
                !validation.soldOut ? (
                  <p className="mt-2 text-sm text-foreground/70">
                    Price updated to {formatPrice(line.tierPriceCents)} per pack
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-sm border border-espresso/20 text-lg disabled:opacity-40"
                    disabled={line.packs <= 1}
                    onClick={() =>
                      setLinePacks(
                        line.productId,
                        line.optionId,
                        line.packs - 1,
                      )
                    }
                    aria-label="Decrease packs"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {line.packs}
                  </span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-sm border border-espresso/20 text-lg disabled:opacity-40"
                    disabled={line.packs >= 99}
                    onClick={() =>
                      setLinePacks(
                        line.productId,
                        line.optionId,
                        line.packs + 1,
                      )
                    }
                    aria-label="Increase packs"
                  >
                    +
                  </button>
                </div>
                <p className="min-w-[5rem] text-right text-sm font-semibold text-foreground">
                  {formatPrice(total)}
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/60 hover:text-foreground"
                  onClick={() => removeLine(line.productId, line.optionId)}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-col items-start gap-4 pt-2 lg:pt-4">
        <div className="sm:ml-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/60">
            Subtotal
          </p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {formatPrice(subtotalCents)}
          </p>
          <p className="mt-1 text-xs text-foreground/80">
            Delivery and tax at checkout
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:ml-auto">
          <Button href="/shop" variant="secondary">
            Keep shopping
          </Button>
          {canCheckout ? (
            <Button href="/checkout">Checkout →</Button>
          ) : (
            <Button type="button" disabled>
              {effectiveOrderWindow.isOpen
                ? "Checkout unavailable"
                : "Orders closed"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
