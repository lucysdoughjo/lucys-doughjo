import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Primary image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "priceCents",
      title: "Base price (cents)",
      type: "number",
      description:
        "Price for one unit, or for the full pack when Units per item is greater than 1 (e.g. bagel 4-pack).",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "unitsPerItem",
      title: "Units per item",
      type: "number",
      initialValue: 1,
      description:
        "Use 4 for items sold only as a 4-pack. Inventory counts use tier quantity × packs in cart.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "unitLabel",
      title: "Unit label",
      type: "string",
      initialValue: "each",
      description: 'Display label, e.g. "each" or "4-pack".',
    }),
    defineField({
      name: "priceTiers",
      title: "Pack / volume pricing",
      type: "array",
      description:
        "Optional larger packs on the same product (e.g. 3 for $10, dozen). Customer picks the pack on the product page.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "quantity",
              title: "Units in pack",
              type: "number",
              validation: (rule) => rule.required().min(2),
            }),
            defineField({
              name: "priceCents",
              title: "Pack price (cents)",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: "label",
              title: "Display label (optional)",
              type: "string",
              description: 'Example: "3 for $10"',
            }),
          ],
          preview: {
            select: {
              quantity: "quantity",
              priceCents: "priceCents",
              label: "label",
            },
            prepare({ quantity, priceCents, label }) {
              const price =
                typeof priceCents === "number"
                  ? `$${(priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2)}`
                  : "";
              return {
                title: label || `${quantity} for ${price}`,
                subtitle: quantity ? `${quantity} units` : undefined,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "allergens",
      title: "Allergens",
      type: "string",
    }),
    defineField({
      name: "availableThisWeek",
      title: "Available this week",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "weeklyLimit",
      title: "Weekly limit (optional)",
      type: "number",
      description: "Leave empty to manage sold-out manually in Studio.",
    }),
    defineField({
      name: "soldOut",
      title: "Sold out",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "category.name",
      media: "image",
    },
  },
});
