import { describe, expect, it } from "vitest";
import {
  isEffectivelySoldOut,
  remainingStockLabel,
  remainingUnits,
} from "@/lib/inventory";

describe("remainingUnits", () => {
  it("returns null when Lucy manages sold-out by hand", () => {
    expect(
      remainingUnits({
        weeklyLimit: null,
        unitsSoldThisWeek: 4,
        unitsReservedThisWeek: 1,
      }),
    ).toBeNull();
  });

  it("subtracts sold and reserved units", () => {
    expect(
      remainingUnits({
        weeklyLimit: 12,
        unitsSoldThisWeek: 4,
        unitsReservedThisWeek: 2,
      }),
    ).toBe(6);
  });

  it("never goes below zero", () => {
    expect(
      remainingUnits({
        weeklyLimit: 3,
        unitsSoldThisWeek: 2,
        unitsReservedThisWeek: 4,
      }),
    ).toBe(0);
  });
});

describe("isEffectivelySoldOut", () => {
  it("treats remaining zero as sold out", () => {
    expect(isEffectivelySoldOut(false, 0)).toBe(true);
    expect(isEffectivelySoldOut(true, 5)).toBe(true);
    expect(isEffectivelySoldOut(false, 5)).toBe(false);
    expect(isEffectivelySoldOut(false, null)).toBe(false);
  });
});

describe("remainingStockLabel", () => {
  it("returns copy only when stock remains", () => {
    expect(remainingStockLabel(1)).toBe("1 left this week");
    expect(remainingStockLabel(4)).toBe("4 left this week");
    expect(remainingStockLabel(0)).toBeNull();
    expect(remainingStockLabel(null)).toBeNull();
  });
});
