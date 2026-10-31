import { NextResponse } from "next/server";
import { handlePaymentIntentSucceeded } from "@/lib/checkout/fulfill-payment";
import {
  expireStalePendingOrders,
  prepareInventoryForWeek,
  recoverIncompleteInventory,
} from "@/lib/checkout/orders";
import { getCurrentDropWeekStart } from "@/sanity/checkout-fetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const expired = await expireStalePendingOrders(new Date(), async (order, intent) => {
    await handlePaymentIntentSucceeded({
      paymentIntentId: intent.id,
      amountCents: intent.amount,
      orderId: order._id,
    });
  });
  const recovered = await recoverIncompleteInventory();
  const weekStart = await getCurrentDropWeekStart();
  await prepareInventoryForWeek(weekStart);

  return NextResponse.json({
    ok: true,
    expired,
    recovered,
    weekStart,
  });
}
