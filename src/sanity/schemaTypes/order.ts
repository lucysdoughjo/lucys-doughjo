import { defineField, defineType } from "sanity";

export const order = defineType({
  name: "order",
  title: "Order",
  type: "document",
  description:
    "Contains customer PII. Keep the Sanity dataset private. Changing status here does not move inventory — use the website checkout/webhooks.",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order number",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description:
        "Updated by Stripe checkout. Manual edits do not reserve, commit, or release weekly inventory.",
      options: {
        list: [
          { title: "Pending payment", value: "pending" },
          { title: "Paid", value: "paid" },
          { title: "Canceled", value: "canceled" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
        ],
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "weekStart",
      title: "Drop week start",
      type: "date",
    }),
    defineField({
      name: "customerName",
      title: "Customer name",
      type: "string",
    }),
    defineField({
      name: "customerEmail",
      title: "Customer email",
      type: "string",
    }),
    defineField({
      name: "customerPhone",
      title: "Customer phone",
      type: "string",
    }),
    defineField({
      name: "fulfillment",
      title: "Fulfillment",
      type: "string",
      options: {
        list: [
          { title: "Pickup", value: "pickup" },
          { title: "Delivery", value: "delivery" },
        ],
      },
    }),
    defineField({
      name: "fulfillmentAddress",
      title: "Fulfillment address",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "fulfillmentInstructions",
      title: "Pickup / delivery instructions",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "fulfillmentDateLabel",
      title: "Fulfillment Sunday",
      type: "string",
    }),
    defineField({
      name: "orderNotes",
      title: "Customer note",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "items",
      title: "Line items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "productId", type: "string", title: "Product ID" }),
            defineField({ name: "slug", type: "string", title: "Slug" }),
            defineField({ name: "name", type: "string", title: "Name" }),
            defineField({ name: "imageUrl", type: "string", title: "Image URL" }),
            defineField({ name: "optionId", type: "string", title: "Option ID" }),
            defineField({ name: "optionLabel", type: "string", title: "Option label" }),
            defineField({ name: "tierQuantity", type: "number", title: "Units per pack" }),
            defineField({ name: "tierPriceCents", type: "number", title: "Pack price (cents)" }),
            defineField({ name: "packs", type: "number", title: "Packs" }),
            defineField({ name: "units", type: "number", title: "Total units" }),
            defineField({ name: "lineTotalCents", type: "number", title: "Line total (cents)" }),
          ],
        },
      ],
    }),
    defineField({
      name: "subtotalCents",
      title: "Subtotal (cents)",
      type: "number",
    }),
    defineField({
      name: "deliveryFeeCents",
      title: "Delivery fee (cents)",
      type: "number",
    }),
    defineField({
      name: "totalCents",
      title: "Total (cents)",
      type: "number",
    }),
    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe PaymentIntent ID",
      type: "string",
    }),
    defineField({
      name: "emailsSentAt",
      title: "Confirmation emails sent at",
      type: "datetime",
    }),
    defineField({
      name: "inventoryCommittedAt",
      title: "Inventory committed at",
      type: "datetime",
    }),
    defineField({
      name: "inventoryCommittedProductIds",
      title: "Products with committed inventory",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "holdExpiresAt",
      title: "Hold expires at",
      type: "datetime",
    }),
    defineField({
      name: "reservationReleasedAt",
      title: "Reservation released at",
      type: "datetime",
    }),
    defineField({
      name: "reservationReleasedProductIds",
      title: "Products with released reservation",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "refundedAt",
      title: "Refunded at",
      type: "datetime",
    }),
    defineField({
      name: "refundInventoryReversedAt",
      title: "Refund inventory reversed at",
      type: "datetime",
    }),
    defineField({
      name: "refundInventoryReversedProductIds",
      title: "Products with reversed refund inventory",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "reservationUnits",
      title: "Reserved units by product",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "productId", type: "string", title: "Product ID" }),
            defineField({ name: "units", type: "number", title: "Units reserved" }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "orderNumber",
      subtitle: "status",
      customer: "customerName",
    },
    prepare({ title, subtitle, customer }) {
      return {
        title: title || "Order",
        subtitle: [subtitle, customer].filter(Boolean).join(" · "),
      };
    },
  },
});
