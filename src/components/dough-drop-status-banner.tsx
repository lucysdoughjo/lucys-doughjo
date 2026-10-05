import type { OrderWindowState } from "@/lib/order-window";

const tone: Record<OrderWindowState["status"], string> = {
  open: "border-secondary/30 bg-secondary/10 text-foreground",
  closing_soon: "border-highlight/50 bg-highlight/25 text-foreground",
  closed: "border-espresso/15 bg-espresso/5 text-foreground/85",
  sold_out: "border-accent/30 bg-accent/10 text-foreground",
};

export function DoughDropStatusBanner({ state }: { state: OrderWindowState }) {
  return (
    <div
      className={`border-b px-4 py-2.5 text-center text-sm ${tone[state.status]}`}
      role="status"
    >
      <span className="font-semibold uppercase tracking-[0.08em]">
        Sunday Dough Drop ·{" "}
      </span>
      {state.label}
    </div>
  );
}
