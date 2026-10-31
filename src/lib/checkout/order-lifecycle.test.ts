import { describe, expect, it } from "vitest";
import {
  isFullRefund,
  isPaymentStillInFlight,
  latePaymentAction,
  shouldApplyRefundToInventory,
  shouldSkipPaidCommitForWeekMismatch,
} from "@/lib/checkout/order-lifecycle";

describe("latePaymentAction", () => {
  it("fulfills a pending order", () => {
    expect(
      latePaymentAction({
        status: "pending",
        reservationReleasedAt: null,
        orderWeekStart: "2026-10-27",
        currentWeekStart: "2026-10-27",
      }),
    ).toBe("fulfill");
  });

  it("retries inventory on an already paid order", () => {
    expect(
      latePaymentAction({
        status: "paid",
        reservationReleasedAt: null,
        orderWeekStart: "2026-10-27",
        currentWeekStart: "2026-10-27",
      }),
    ).toBe("fulfill");
  });

  it("re-reserves a canceled order whose hold was released this week", () => {
    expect(
      latePaymentAction({
        status: "canceled",
        reservationReleasedAt: "2026-10-28T00:00:00.000Z",
        orderWeekStart: "2026-10-27",
        currentWeekStart: "2026-10-27",
      }),
    ).toBe("rereserve");
  });

  it("refunds a late success after the drop week has rolled over", () => {
    expect(
      latePaymentAction({
        status: "canceled",
        reservationReleasedAt: "2026-10-28T00:00:00.000Z",
        orderWeekStart: "2026-10-20",
        currentWeekStart: "2026-10-27",
      }),
    ).toBe("refund");
  });

  it("fulfills a canceled order whose hold is still in place", () => {
    expect(
      latePaymentAction({
        status: "canceled",
        reservationReleasedAt: null,
        orderWeekStart: "2026-10-27",
        currentWeekStart: "2026-10-27",
      }),
    ).toBe("fulfill");
  });

  it("ignores refunded orders", () => {
    expect(
      latePaymentAction({
        status: "refunded",
        reservationReleasedAt: null,
        orderWeekStart: "2026-10-27",
        currentWeekStart: "2026-10-27",
      }),
    ).toBe("ignore");
  });
});

describe("isFullRefund", () => {
  it("requires the refunded amount to cover the order total", () => {
    expect(isFullRefund(2400, 2400)).toBe(true);
    expect(isFullRefund(1200, 2400)).toBe(false);
  });
});

describe("shouldApplyRefundToInventory", () => {
  it("skips the decrement when inventory already moved to a new week", () => {
    expect(
      shouldApplyRefundToInventory({
        inventoryWeekStart: "2026-10-27",
        orderWeekStart: "2026-10-20",
      }),
    ).toBe(false);
  });

  it("applies the decrement in the same week", () => {
    expect(
      shouldApplyRefundToInventory({
        inventoryWeekStart: "2026-10-27",
        orderWeekStart: "2026-10-27",
      }),
    ).toBe(true);
  });
});

describe("shouldSkipPaidCommitForWeekMismatch", () => {
  it("skips a paid commit that would rewind a newer inventory week", () => {
    expect(
      shouldSkipPaidCommitForWeekMismatch({
        inventoryWeekStart: "2026-10-27",
        orderWeekStart: "2026-10-20",
      }),
    ).toBe(true);
  });
});

describe("isPaymentStillInFlight", () => {
  it("keeps holds while Stripe is still processing", () => {
    expect(isPaymentStillInFlight("processing")).toBe(true);
    expect(isPaymentStillInFlight("requires_action")).toBe(true);
    expect(isPaymentStillInFlight("requires_payment_method")).toBe(false);
    expect(isPaymentStillInFlight("canceled")).toBe(false);
  });
});
