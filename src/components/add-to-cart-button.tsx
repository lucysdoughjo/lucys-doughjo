"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { useCart } from "@/components/cart-provider";
import type { PurchaseOption } from "@/lib/pricing";

type AddToCartButtonProps = {
  productId: string;
  slug: string;
  productName: string;
  imageUrl: string;
  soldOut?: boolean;
  orderingDisabled?: boolean;
  purchaseOption?: PurchaseOption;
  packs?: number;
  className?: string;
};

export function AddToCartButton({
  productId,
  slug,
  productName,
  imageUrl,
  soldOut = false,
  orderingDisabled = false,
  purchaseOption,
  packs = 1,
  className,
}: AddToCartButtonProps) {
  const { addLine, setLinePacks, lines } = useCart();
  const [justSaved, setJustSaved] = useState(false);
  const cannotOrder = soldOut || orderingDisabled || !purchaseOption;
  const existing = purchaseOption
    ? lines.find(
        (line) =>
          line.productId === productId && line.optionId === purchaseOption.id,
      )
    : undefined;
  const inCart = Boolean(existing);
  const quantityUnchanged = inCart && existing?.packs === packs;

  useEffect(() => {
    setJustSaved(false);
  }, [purchaseOption?.id]);

  function handleClick() {
    if (cannotOrder || !purchaseOption || quantityUnchanged) return;

    if (inCart) {
      setLinePacks(productId, purchaseOption.id, packs);
    } else {
      addLine({
        productId,
        slug,
        name: productName,
        imageUrl,
        optionId: purchaseOption.id,
        optionLabel: purchaseOption.label,
        tierQuantity: purchaseOption.tierQuantity,
        tierPriceCents: purchaseOption.tierPriceCents,
        packs,
      });
    }

    setJustSaved(true);
  }

  const label = soldOut
    ? "Sold out"
    : orderingDisabled
      ? "Orders closed"
      : justSaved && existing && existing.packs === packs
        ? "Added"
        : inCart
          ? "Update cart"
          : "Add to cart →";

  return (
    <Button
      type="button"
      variant="primary"
      className={className}
      disabled={cannotOrder || quantityUnchanged}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
