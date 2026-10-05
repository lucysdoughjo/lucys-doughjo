import Link from "next/link";
import { Button } from "@/components/button";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-foreground">
        Item not available this week
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/75">
        This product isn&apos;t on the current drop, or the link may be outdated.
        Check the full menu for what&apos;s baking this Sunday.
      </p>
      <Button href="/shop" className="mt-8">
        View this week&apos;s menu →
      </Button>
      <Link
        href="/"
        className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
