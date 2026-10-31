export type ReservationUnit = {
  productId: string;
  units: number;
};

export function mergeReservationUnits(
  units: ReservationUnit[],
): ReservationUnit[] {
  const byProduct = new Map<string, number>();

  for (const entry of units) {
    if (!entry.productId || !Number.isFinite(entry.units) || entry.units <= 0) {
      continue;
    }
    byProduct.set(
      entry.productId,
      (byProduct.get(entry.productId) ?? 0) + Math.floor(entry.units),
    );
  }

  return [...byProduct.entries()].map(([productId, reserved]) => ({
    productId,
    units: reserved,
  }));
}

export function reservationWouldExceedLimit(input: {
  weeklyLimit: number | null;
  unitsSold: number;
  unitsReserved: number;
  deltaUnits: number;
}): boolean {
  if (input.weeklyLimit === null || input.deltaUnits <= 0) {
    return false;
  }

  const remaining =
    input.weeklyLimit -
    Math.max(0, input.unitsSold) -
    Math.max(0, input.unitsReserved);

  return input.deltaUnits > remaining;
}

export function applyWeekResetIfNeeded(input: {
  inventoryWeekStart: string | null;
  currentWeekStart: string | null;
  unitsSold: number;
  unitsReserved: number;
  soldOut: boolean;
}): {
  unitsSold: number;
  unitsReserved: number;
  soldOut: boolean;
  reset: boolean;
} {
  if (
    !input.currentWeekStart ||
    input.inventoryWeekStart === input.currentWeekStart
  ) {
    return {
      unitsSold: Math.max(0, input.unitsSold),
      unitsReserved: Math.max(0, input.unitsReserved),
      soldOut: input.soldOut,
      reset: false,
    };
  }

  return {
    unitsSold: 0,
    unitsReserved: 0,
    soldOut: false,
    reset: true,
  };
}

export function nextInventoryAfterPaidCommit(input: {
  unitsSold: number;
  unitsReserved: number;
  units: number;
  reservationAlreadyReleased: boolean;
  weeklyLimit: number | null;
  soldOut: boolean;
}): {
  unitsSold: number;
  unitsReserved: number;
  soldOut: boolean;
} {
  const units = Math.max(0, input.units);
  const unitsSold = Math.max(0, input.unitsSold) + units;
  const unitsReserved = input.reservationAlreadyReleased
    ? Math.max(0, input.unitsReserved)
    : Math.max(0, input.unitsReserved - units);
  const hitLimit =
    input.weeklyLimit !== null &&
    input.weeklyLimit > 0 &&
    unitsSold >= input.weeklyLimit;

  return {
    unitsSold,
    unitsReserved,
    soldOut: input.soldOut || hitLimit,
  };
}

export function nextInventoryAfterRefund(input: {
  unitsSold: number;
  units: number;
  weeklyLimit: number | null;
  soldOut: boolean;
}): {
  unitsSold: number;
  soldOut: boolean;
} {
  const unitsSold = Math.max(0, input.unitsSold - Math.max(0, input.units));
  const soldOut =
    input.weeklyLimit !== null && input.weeklyLimit > 0
      ? unitsSold >= input.weeklyLimit
      : input.soldOut && unitsSold > 0;

  return { unitsSold, soldOut };
}
