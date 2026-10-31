"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";

export function OrderSuccessClearCart({ shouldClear }: { shouldClear: boolean }) {
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (shouldClear && !cleared.current) {
      clearCart();
      cleared.current = true;
    }
  }, [shouldClear, clearCart]);

  return null;
}
