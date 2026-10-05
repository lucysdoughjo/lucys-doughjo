import { Button } from "@/components/button";
import { SectionHeading } from "@/components/section-heading";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Cart"
        title="Your cart is empty"
        description="When the shop opens for the week, items you add will show up here."
      />
      <Button href="/shop" className="mt-8">
        Shop this week&apos;s drop →
      </Button>
    </div>
  );
}
