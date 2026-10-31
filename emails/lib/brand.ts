export const brandColors = {
  cream: "#f9f5ee",
  espresso: "#3b2416",
  terracotta: "#c65a3e",
  sage: "#8a987a",
  goldenWheat: "#d9b368",
  berryJam: "#8b2e3b",
} as const;

export function getEmailSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://lucydoughjo.com";
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
