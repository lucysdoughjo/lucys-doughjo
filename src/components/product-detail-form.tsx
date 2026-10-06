"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
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
};

export function ProductDetailForm({
  productId,
  slug,
  productName,
  imageUrl,
  purchaseOptions,
  soldOut,
  orderingDisabled,
}: ProductDetailFormProps) {
  const [selectedOptionId, setSelectedOptionId] = useState(
    purchaseOptions[0]?.id ?? "",
  );
  const [packs, setPacks] = useState(1);

  const selectedOption = useMemo(
    () =>
      purchaseOptions.find((option) => option.id === selectedOptionId) ??
      purchaseOptions[0],
    [purchaseOptions, selectedOptionId],
  );

  if (!selectedOption) {
    return null;
  }

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
                    disabled={soldOut || orderingDisabled}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {option.label}
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
            disabled={packs <= 1 || soldOut || orderingDisabled}
            onClick={() => setPacks((value) => Math.max(1, value - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min={1}
            max={99}
            value={packs}
            onChange={(event) =>
              setPacks(
                Math.min(
                  99,
                  Math.max(1, Math.floor(Number(event.target.value) || 1)),
                ),
              )
            }
            className="h-10 w-16 rounded-sm border border-espresso/20 bg-cream text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            disabled={soldOut || orderingDisabled}
          />
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-sm border border-espresso/20 text-lg disabled:opacity-40"
            disabled={soldOut || orderingDisabled}
            onClick={() => setPacks((value) => Math.min(99, value + 1))}
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

      <AddToCartButton
        productId={productId}
        slug={slug}
        productName={productName}
        imageUrl={imageUrl}
        soldOut={soldOut}
        orderingDisabled={orderingDisabled}
        purchaseOption={selectedOption}
        packs={packs}
        className="w-full sm:w-auto"
      />
    </div>
  );
}
