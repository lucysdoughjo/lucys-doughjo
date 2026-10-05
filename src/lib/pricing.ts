export type PriceTier = {
  quantity: number;
  priceCents: number;
  label?: string | null;
};

export type PurchaseOption = {
  id: string;
  tierQuantity: number;
  tierPriceCents: number;
  label: string;
};

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function tierLabel(tier: PriceTier) {
  if (tier.label?.trim()) return tier.label.trim();
  return `${tier.quantity} for ${formatPrice(tier.priceCents)}`;
}

function makeOption(
  tierQuantity: number,
  tierPriceCents: number,
  label: string,
): PurchaseOption {
  return {
    id: `${tierQuantity}-${tierPriceCents}`,
    tierQuantity,
    tierPriceCents,
    label,
  };
}

export function buildPurchaseOptions(input: {
  priceCents: number;
  unitLabel?: string | null;
  unitsPerItem?: number | null;
  priceTiers?: PriceTier[] | null;
}): PurchaseOption[] {
  const unitsPerItem = input.unitsPerItem ?? 1;
  const unitLabel = input.unitLabel?.trim() || "each";
  const tiers = [...(input.priceTiers ?? [])].sort(
    (a, b) => a.quantity - b.quantity,
  );

  const options: PurchaseOption[] = [];

  if (unitsPerItem > 1) {
    options.push(
      makeOption(
        unitsPerItem,
        input.priceCents,
        `${formatPrice(input.priceCents)} ${unitLabel}`,
      ),
    );
  } else {
    options.push(
      makeOption(1, input.priceCents, `${formatPrice(input.priceCents)} each`),
    );
  }

  for (const tier of tiers) {
    if (tier.quantity <= 0 || tier.priceCents < 0) continue;
    if (unitsPerItem > 1 && tier.quantity === unitsPerItem) continue;
    options.push(
      makeOption(tier.quantity, tier.priceCents, tierLabel(tier)),
    );
  }

  return options;
}

export function formatPriceLabel(input: {
  priceCents: number;
  unitLabel?: string | null;
  unitsPerItem?: number | null;
  priceTiers?: PriceTier[] | null;
}): string {
  const options = buildPurchaseOptions(input);
  return options.map((option) => option.label).join(" · ");
}

export function computeLineTotalCents(
  tierPriceCents: number,
  packs: number,
): number {
  return tierPriceCents * Math.max(0, packs);
}

export function unitsFromLine(tierQuantity: number, packs: number): number {
  return tierQuantity * Math.max(0, packs);
}
