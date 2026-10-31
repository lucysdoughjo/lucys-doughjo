import { describe, expect, it } from "vitest";
import {
  applyWeekResetIfNeeded,
  mergeReservationUnits,
  nextInventoryAfterPaidCommit,
  nextInventoryAfterRefund,
  reservationWouldExceedLimit,
} from "@/lib/checkout/reservation";

describe("mergeReservationUnits", () => {
  it("sums units for the same product", () => {
    expect(
      mergeReservationUnits([
        { productId: "loaf", units: 2 },
        { productId: "cookie", units: 4 },
        { productId: "loaf", units: 3 },
      ]),
    ).toEqual([
      { productId: "loaf", units: 5 },
      { productId: "cookie", units: 4 },
    ]);
  });

  it("drops empty or invalid rows", () => {
    expect(
      mergeReservationUnits([
        { productId: "", units: 2 },
        { productId: "loaf", units: 0 },
        { productId: "loaf", units: -1 },
      ]),
    ).toEqual([]);
  });
});

describe("reservationWouldExceedLimit", () => {
  it("allows a hold that still fits", () => {
    expect(
      reservationWouldExceedLimit({
        weeklyLimit: 10,
        unitsSold: 4,
        unitsReserved: 3,
        deltaUnits: 3,
      }),
    ).toBe(false);
  });

  it("rejects a hold that would oversell", () => {
    expect(
      reservationWouldExceedLimit({
        weeklyLimit: 10,
        unitsSold: 4,
        unitsReserved: 3,
        deltaUnits: 4,
      }),
    ).toBe(true);
  });

  it("does not cap products without a weekly limit", () => {
    expect(
      reservationWouldExceedLimit({
        weeklyLimit: null,
        unitsSold: 99,
        unitsReserved: 99,
        deltaUnits: 10,
      }),
    ).toBe(false);
  });
});

describe("applyWeekResetIfNeeded", () => {
  it("zeros counters when the drop week changes", () => {
    expect(
      applyWeekResetIfNeeded({
        inventoryWeekStart: "2026-10-20",
        currentWeekStart: "2026-10-27",
        unitsSold: 8,
        unitsReserved: 2,
        soldOut: true,
      }),
    ).toEqual({
      unitsSold: 0,
      unitsReserved: 0,
      soldOut: false,
      reset: true,
    });
  });

  it("keeps counters for the current week", () => {
    expect(
      applyWeekResetIfNeeded({
        inventoryWeekStart: "2026-10-27",
        currentWeekStart: "2026-10-27",
        unitsSold: 8,
        unitsReserved: 2,
        soldOut: true,
      }),
    ).toEqual({
      unitsSold: 8,
      unitsReserved: 2,
      soldOut: true,
      reset: false,
    });
  });
});

describe("nextInventoryAfterPaidCommit", () => {
  it("moves reserved units into sold", () => {
    expect(
      nextInventoryAfterPaidCommit({
        unitsSold: 2,
        unitsReserved: 5,
        units: 3,
        reservationAlreadyReleased: false,
        weeklyLimit: 10,
        soldOut: false,
      }),
    ).toEqual({
      unitsSold: 5,
      unitsReserved: 2,
      soldOut: false,
    });
  });

  it("does not decrement reserved when the hold was already released", () => {
    expect(
      nextInventoryAfterPaidCommit({
        unitsSold: 2,
        unitsReserved: 4,
        units: 3,
        reservationAlreadyReleased: true,
        weeklyLimit: 5,
        soldOut: false,
      }),
    ).toEqual({
      unitsSold: 5,
      unitsReserved: 4,
      soldOut: true,
    });
  });

  it("keeps a manual sold-out flag when the numeric limit is not reached", () => {
    expect(
      nextInventoryAfterPaidCommit({
        unitsSold: 2,
        unitsReserved: 5,
        units: 3,
        reservationAlreadyReleased: false,
        weeklyLimit: 20,
        soldOut: true,
      }),
    ).toEqual({
      unitsSold: 5,
      unitsReserved: 2,
      soldOut: true,
    });
  });
});

describe("nextInventoryAfterRefund", () => {
  it("returns units and clears sold-out when stock remains", () => {
    expect(
      nextInventoryAfterRefund({
        unitsSold: 6,
        units: 2,
        weeklyLimit: 6,
        soldOut: true,
      }),
    ).toEqual({
      unitsSold: 4,
      soldOut: false,
    });
  });
});
