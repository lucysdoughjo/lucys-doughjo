export type OrderStatus =
  | "pending"
  | "paid"
  | "canceled"
  | "failed"
  | "refunded";

export type LatePaymentAction = "fulfill" | "rereserve" | "refund" | "ignore";

export function latePaymentAction(input: {
  status: OrderStatus;
  reservationReleasedAt: string | null;
  orderWeekStart: string | null;
  currentWeekStart: string | null;
}): LatePaymentAction {
  if (input.status === "refunded") return "ignore";
  if (input.status === "paid" || input.status === "pending") return "fulfill";

  if (input.status === "canceled" || input.status === "failed") {
    if (
      input.orderWeekStart &&
      input.currentWeekStart &&
      input.orderWeekStart !== input.currentWeekStart
    ) {
      return "refund";
    }

    if (input.reservationReleasedAt) return "rereserve";
    return "fulfill";
  }

  return "ignore";
}

export function isFullRefund(
  amountRefundedCents: number,
  orderTotalCents: number,
): boolean {
  return amountRefundedCents >= orderTotalCents;
}

export function shouldApplyRefundToInventory(input: {
  inventoryWeekStart: string | null;
  orderWeekStart: string | null;
}): boolean {
  if (!input.inventoryWeekStart || !input.orderWeekStart) {
    return true;
  }
  return input.inventoryWeekStart === input.orderWeekStart;
}

export function shouldSkipPaidCommitForWeekMismatch(input: {
  inventoryWeekStart: string | null;
  orderWeekStart: string | null;
}): boolean {
  return Boolean(
    input.inventoryWeekStart &&
      input.orderWeekStart &&
      input.inventoryWeekStart !== input.orderWeekStart,
  );
}

const ACTIVE_PAYMENT_STATUSES = new Set([
  "processing",
  "requires_action",
  "requires_confirmation",
  "requires_capture",
]);

export function isPaymentStillInFlight(status: string): boolean {
  return ACTIVE_PAYMENT_STATUSES.has(status);
}
