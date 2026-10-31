import type { OrderWindowState } from "@/lib/order-window";

const tone: Record<OrderWindowState["status"], string> = {
  closed: "border-sage/30 bg-sage/30 text-foreground",
  sold_out: "border-golden-wheat/50 bg-golden-wheat/25 text-foreground",
  closing_soon: "border-berry-jam/30 bg-berry-jam/10 text-foreground",
  open: "border-terracotta/30 bg-terracotta/24 text-foreground",
};

export function DoughDropStatusBanner({ state }: { state: OrderWindowState }) {
  return (
    <div
      className={`border-y px-4 py-2.5 text-center text-sm ${tone[state.status]}`}
      role="status"
    >
      <span className="font-semibold uppercase tracking-[0.08em]">
        Sunday Dough Drop ·{" "}
      </span>
      {state.label}
    </div>
  );
}
