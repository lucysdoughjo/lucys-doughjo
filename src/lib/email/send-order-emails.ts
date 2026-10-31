import OrderCustomerEmail from "../../../emails/order-customer";
import OrderOwnerEmail from "../../../emails/order-owner";
import {
  buildFulfillmentCopy,
  cartLinesToEmailItems,
  type OrderEmailPayload,
} from "./order-types";
import { getFromEmailAddress, getResendClient } from "./resend-client";

export type SendOrderEmailsInput = {
  payload: OrderEmailPayload;
  ownerEmail: string;
};

export type SendOrderEmailsResult =
  | { ok: true; customerEmailId?: string; ownerEmailId?: string }
  | { ok: false; message: string };

/**
 * Sends customer order confirmation and owner notification.
 * Idempotent per order number so webhook and status-poll retries are safe.
 */
export async function sendOrderEmails({
  payload,
  ownerEmail,
}: SendOrderEmailsInput): Promise<SendOrderEmailsResult> {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false, message: "Email is not configured." };
  }

  const from = getFromEmailAddress();
  const items = cartLinesToEmailItems(payload.items);
  const customerFulfillment = buildFulfillmentCopy(payload);
  const ownerFulfillment = buildFulfillmentCopy(payload, {
    omitFulfillmentNotes: true,
  });
  const idempotencyBase = `order/${payload.orderNumber}`;

  const sharedProps = {
    orderNumber: payload.orderNumber,
    fulfillmentDateLabel: payload.fulfillmentDateLabel,
    items,
    subtotalCents: payload.subtotalCents,
    deliveryFeeCents: payload.deliveryFeeCents,
    totalCents: payload.totalCents,
    orderNotes: payload.orderNotes,
  };

  const { data: customerData, error: customerError } = await resend.emails.send(
    {
      from,
      to: payload.customer.email,
      replyTo: ownerEmail,
      subject: `Order ${payload.orderNumber} confirmed — Lucy's Doughjo`,
      react: OrderCustomerEmail({
        ...sharedProps,
        ...customerFulfillment,
        customerName: payload.customer.name,
      }),
    },
    { idempotencyKey: `${idempotencyBase}/customer` },
  );

  if (customerError) {
    return {
      ok: false,
      message: "Order was placed but the confirmation email could not be sent.",
    };
  }

  const { data: ownerData, error: ownerError } = await resend.emails.send(
    {
      from,
      to: ownerEmail,
      replyTo: payload.customer.email,
      subject: `New order ${payload.orderNumber} — ${payload.customer.name}`,
      react: OrderOwnerEmail({
        ...sharedProps,
        ...ownerFulfillment,
        customerName: payload.customer.name,
        customerEmail: payload.customer.email,
        customerPhone: payload.customer.phone,
      }),
    },
    { idempotencyKey: `${idempotencyBase}/owner` },
  );

  if (ownerError) {
    return {
      ok: false,
      message: "Customer email sent, but the owner notification failed.",
    };
  }

  return {
    ok: true,
    customerEmailId: customerData?.id,
    ownerEmailId: ownerData?.id,
  };
}
