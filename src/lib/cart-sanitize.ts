import { cartLineKey, type CartLine } from "@/lib/cart-types";

export const MAX_CART_LINES = 20;
export const MAX_PACKS = 99;
export const MIN_PACKS = 1;

const MAX_ID_LEN = 128;
const MAX_SLUG_LEN = 128;
const MAX_NAME_LEN = 200;
const MAX_LABEL_LEN = 200;
const MAX_IMAGE_URL_LEN = 2048;

const PLACEHOLDER_IMAGE = "/assets/artisan_sourdough/artisan-sourdough-primary.jpg";

function cleanString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function finiteInt(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const n = Math.floor(value);
  if (n < min || n > max) return null;
  return n;
}

export function isAllowedCartImageUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url.length <= MAX_IMAGE_URL_LEN;
  }
  if (url.startsWith("https://cdn.sanity.io/")) {
    return url.length <= MAX_IMAGE_URL_LEN;
  }
  return false;
}

export function sanitizeCartImageUrl(url: string): string {
  const trimmed = url.trim().slice(0, MAX_IMAGE_URL_LEN);
  if (isAllowedCartImageUrl(trimmed)) return trimmed;
  return PLACEHOLDER_IMAGE;
}

export function sanitizeCartLine(value: unknown): CartLine | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  const productId = cleanString(raw.productId, MAX_ID_LEN);
  const slug = cleanString(raw.slug, MAX_SLUG_LEN);
  const name = cleanString(raw.name, MAX_NAME_LEN);
  const optionId = cleanString(raw.optionId, MAX_ID_LEN);
  const optionLabel = cleanString(raw.optionLabel, MAX_LABEL_LEN);

  if (!productId || !slug || !name || !optionId || !optionLabel) {
    return null;
  }

  const packs = finiteInt(raw.packs, MIN_PACKS, MAX_PACKS);
  const tierQuantity = finiteInt(raw.tierQuantity, 1, 9999);
  const tierPriceCents = finiteInt(raw.tierPriceCents, 0, 10_000_000);

  if (packs === null || tierQuantity === null || tierPriceCents === null) {
    return null;
  }

  const imageUrl = sanitizeCartImageUrl(
    cleanString(raw.imageUrl, MAX_IMAGE_URL_LEN),
  );

  return {
    productId,
    slug,
    name,
    imageUrl,
    optionId,
    optionLabel,
    tierQuantity,
    tierPriceCents,
    packs,
  };
}

/** Dedupe by line key; first occurrence wins. */
export function sanitizeCartLines(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const lines: CartLine[] = [];

  for (const item of input) {
    if (lines.length >= MAX_CART_LINES) break;
    const line = sanitizeCartLine(item);
    if (!line) continue;
    const key = cartLineKey(line);
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(line);
  }

  return lines;
}

export function cartLinesEqual(a: CartLine[], b: CartLine[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (cartLineKey(left) !== cartLineKey(right)) return false;
    if (
      left.productId !== right.productId ||
      left.slug !== right.slug ||
      left.name !== right.name ||
      left.imageUrl !== right.imageUrl ||
      left.optionId !== right.optionId ||
      left.optionLabel !== right.optionLabel ||
      left.tierQuantity !== right.tierQuantity ||
      left.tierPriceCents !== right.tierPriceCents ||
      left.packs !== right.packs
    ) {
      return false;
    }
  }
  return true;
}

/** Compare catalog fields only (ignore packs). */
export function cartCatalogFieldsEqual(a: CartLine, b: CartLine): boolean {
  return (
    a.productId === b.productId &&
    a.slug === b.slug &&
    a.name === b.name &&
    a.imageUrl === b.imageUrl &&
    a.optionId === b.optionId &&
    a.optionLabel === b.optionLabel &&
    a.tierQuantity === b.tierQuantity &&
    a.tierPriceCents === b.tierPriceCents
  );
}

function findCurrentLineForCatalogUpdate(
  current: CartLine[],
  sanityLine: CartLine,
): CartLine | undefined {
  return (
    current.find(
      (line) =>
        line.slug === sanityLine.slug &&
        line.tierQuantity === sanityLine.tierQuantity,
    ) ?? current.find((line) => cartLineKey(line) === cartLineKey(sanityLine))
  );
}

export function mergeValidatedCatalogFields(
  current: CartLine[],
  validated: CartLine[],
): CartLine[] {
  return validated.map((sanityLine) => {
    const existing = findCurrentLineForCatalogUpdate(current, sanityLine);
    if (!existing) return sanityLine;
    return {
      ...sanityLine,
      packs: existing.packs,
    };
  });
}
