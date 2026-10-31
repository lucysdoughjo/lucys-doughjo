"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Button } from "@/components/button";
import { useCart } from "@/components/cart-provider";
import {
  computeLineTotalCents,
  formatPrice,
  unitsFromLine,
  type PurchaseOption,
} from "@/lib/pricing";

type ProductDetailFormProps = {
  productId: string;
  slug: string;
  productName: string;
  imageUrl: string;
  purchaseOptions: PurchaseOption[];
  soldOut: boolean;
  orderingDisabled: boolean;
  unitsRemaining?: number | null;
};

export function ProductDetailForm({
  productId,
  slug,
  productName,
  imageUrl,
  purchaseOptions,
  soldOut,
  orderingDisabled,
  unitsRemaining = null,
}: ProductDetailFormProps) {
  const { hydrated, lines } = useCart();
  const [selectedOptionId, setSelectedOptionId] = useState(
    purchaseOptions[0]?.id ?? "",
  );
  const [packs, setPacks] = useState(1);

  useEffect(() => {
    if (!hydrated) return;
    const line = lines.find(
      (entry) =>
        entry.productId === productId && entry.optionId === selectedOptionId,
    );
    setPacks(line?.packs ?? 1);
    // Sync only after hydration and when the selected pack changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting while the user edits quantity
  }, [hydrated, productId, selectedOptionId]);

  const selectedOption = useMemo(
    () =>
      purchaseOptions.find((option) => option.id === selectedOptionId) ??
      purchaseOptions[0],
    [purchaseOptions, selectedOptionId],
  );

  if (!selectedOption) {
    return null;
  }

  const maxPacks =
    unitsRemaining === null
      ? 99
      : Math.max(
          0,
          Math.floor(unitsRemaining / selectedOption.tierQuantity),
        );
  const optionUnavailable = maxPacks === 0;
  const cannotOrder = soldOut || orderingDisabled || optionUnavailable;

  const lineTotalCents = computeLineTotalCents(
    selectedOption.tierPriceCents,
    packs,
  );
  const totalUnits = unitsFromLine(selectedOption.tierQuantity, packs);

  return (
    <div className="mt-8 space-y-6">
      {purchaseOptions.length > 1 ? (
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">
            Choose pack
          </legend>
          <ul className="mt-3 space-y-2">
            {purchaseOptions.map((option) => (
              <li key={option.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-sm border border-espresso/15 px-4 py-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="purchase-option"
                    value={option.id}
                    checked={selectedOption.id === option.id}
                    onChange={() => setSelectedOptionId(option.id)}
                    disabled={
                      soldOut ||
                      orderingDisabled ||
                      (unitsRemaining !== null &&
                        unitsRemaining < option.tierQuantity)
                    }
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {option.label}
                    {unitsRemaining !== null &&
                    unitsRemaining < option.tierQuantity
                      ? " — not enough left"
                      : ""}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      <div>
        <label
          htmlFor="quantity"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80"
        >
          Quantity
        </label>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-espresso/20 text-lg disabled:opacity-40"
            disabled={packs <= 1 || cannotOrder}
            onClick={() => setPacks((value) => Math.max(1, value - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min={1}
            max={Math.max(1, maxPacks)}
            value={packs}
            onChange={(event) =>
              setPacks(
                Math.min(
                  Math.max(1, maxPacks),
                  Math.max(1, Math.floor(Number(event.target.value) || 1)),
                ),
              )
            }
            className="h-10 w-16 rounded-sm border border-espresso/20 bg-white text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            disabled={cannotOrder}
          />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-espresso/20 text-lg disabled:opacity-40"
            disabled={cannotOrder || packs >= Math.max(1, maxPacks)}
            onClick={() =>
              setPacks((value) => Math.min(Math.max(1, maxPacks), value + 1))
            }
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-sm text-foreground/80">
        <span className="font-semibold text-foreground">Line total: </span>
        {formatPrice(lineTotalCents)}
        <span className="text-foreground/60">
          {" "}
          ({totalUnits} {totalUnits === 1 ? "item" : "items"} for this drop)
        </span>
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AddToCartButton
          productId={productId}
          slug={slug}
          productName={productName}
          imageUrl={imageUrl}
          soldOut={soldOut || optionUnavailable}
          orderingDisabled={orderingDisabled}
          purchaseOption={selectedOption}
          packs={packs}
          className="w-full sm:w-auto"
        />
        {hydrated && lines.length > 0 ? (
          <Button href="/cart" variant="secondary" className="w-full sm:w-auto">
            Checkout →
          </Button>
        ) : (
          <Button variant="secondary" disabled className="w-full sm:w-auto">
            Checkout →
          </Button>
        )}
      </div>
    </div>
  );
}
