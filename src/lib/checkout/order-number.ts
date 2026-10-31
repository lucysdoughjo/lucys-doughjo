export function generateOrderNumber(weekStart: string | null, now = new Date()) {
  const weekPart = (weekStart ?? now.toISOString().slice(2, 10).replace(/-/g, ""))
    .replace(/-/g, "")
    .slice(-6);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LDJ-${weekPart}-${random}`;
}
