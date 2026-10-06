"use client";

import { useEffect, useRef, useState } from "react";
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
  const { addLine } = useCart();
  const [added, setAdded] = useState(false);
  const addedTimeoutRef = useRef<number | null>(null);
  const cannotOrder = soldOut || orderingDisabled || !purchaseOption;

  useEffect(() => {
    return () => {
      if (addedTimeoutRef.current !== null) {
        window.clearTimeout(addedTimeoutRef.current);
      }
    };
  }, []);

  function handleClick() {
    if (cannotOrder || !purchaseOption) return;

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

    setAdded(true);
    if (addedTimeoutRef.current !== null) {
      window.clearTimeout(addedTimeoutRef.current);
    }
    addedTimeoutRef.current = window.setTimeout(() => setAdded(false), 2000);
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
          : added
            ? "Added ✓"
            : "Add to cart →"}
    </Button>
  );
}
