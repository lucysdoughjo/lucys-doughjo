export function normalizeUsPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || /[a-zA-Z]/.test(trimmed)) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");
  const ten =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (ten.length !== 10) {
    return null;
  }

  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}
