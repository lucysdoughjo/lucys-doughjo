"use client";

import { Button } from "@/components/button";
import type { PurchaseOption } from "@/lib/pricing";

type AddToCartButtonProps = {
  productName: string;
  soldOut?: boolean;
  orderingDisabled?: boolean;
  purchaseOption?: PurchaseOption;
  packs?: number;
  className?: string;
};

export function AddToCartButton({
  productName,
  soldOut = false,
  orderingDisabled = false,
  purchaseOption,
  packs = 1,
  className,
}: AddToCartButtonProps) {
  const cannotOrder = soldOut || orderingDisabled;

  function handleClick() {
    if (cannotOrder) return;
    const optionLabel = purchaseOption?.label ?? "each";
    console.info(
      `Add to cart (stub): ${packs} × ${optionLabel} — ${productName}`,
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      className={className}
      disabled={cannotOrder}
      onClick={handleClick}
    >
      {soldOut
        ? "Sold out"
        : orderingDisabled
          ? "Orders closed"
          : "Add to cart →"}
    </Button>
  );
}
