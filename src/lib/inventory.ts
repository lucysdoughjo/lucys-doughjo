export function remainingUnits(input: {
  weeklyLimit?: number | null;
  unitsSoldThisWeek?: number | null;
  unitsReservedThisWeek?: number | null;
}): number | null {
  if (typeof input.weeklyLimit !== "number" || input.weeklyLimit <= 0) {
    return null;
  }

  return Math.max(
    0,
    input.weeklyLimit -
      Math.max(0, input.unitsSoldThisWeek ?? 0) -
      Math.max(0, input.unitsReservedThisWeek ?? 0),
  );
}

export function isEffectivelySoldOut(
  soldOut: boolean,
  unitsRemaining: number | null,
) {
  return soldOut || unitsRemaining === 0;
}

export function remainingStockLabel(unitsRemaining: number | null): string | null {
  if (unitsRemaining === null || unitsRemaining <= 0) {
    return null;
  }
  return unitsRemaining === 1
    ? "1 left this week"
    : `${unitsRemaining} left this week`;
}
