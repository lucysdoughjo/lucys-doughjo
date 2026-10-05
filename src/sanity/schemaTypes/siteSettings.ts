import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook URL",
      type: "url",
    }),
    defineField({
      name: "pickupAddress",
      title: "Pickup address",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "pickupInstructions",
      title: "Pickup instructions",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "deliveryZipCodes",
      title: "Delivery ZIP codes",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "deliveryFeeCents",
      title: "Delivery fee (cents)",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "deliveryNotes",
      title: "Delivery notes",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "forceClosed",
      title: "Force orders closed this week",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "customOpenAt",
      title: "Custom open time (override)",
      type: "datetime",
    }),
    defineField({
      name: "customCloseAt",
      title: "Custom close time (override)",
      type: "datetime",
    }),
  ],
});
