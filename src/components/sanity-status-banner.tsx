import { isSanityConfigured } from "@/sanity/env";

export function SanityStatusBanner() {
  if (isSanityConfigured) {
    return null;
  }

  return (
    <div
      className="border-b border-highlight/40 bg-highlight/25 px-4 py-2 text-center text-xs text-foreground/90"
      role="status"
    >
      Sanity is not configured yet — showing placeholder menu items. Add{" "}
      <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code> to{" "}
      <code className="font-mono">.env.local</code>, then run{" "}
      <code className="font-mono">npm run seed:sanity</code>.
    </div>
  );
}
