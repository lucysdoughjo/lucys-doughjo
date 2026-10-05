import { defineField, defineType } from "sanity";

export const weeklyDrop = defineType({
  name: "weeklyDrop",
  title: "Weekly drop",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "This week's drop",
    }),
    defineField({
      name: "weekStart",
      title: "Week start (Monday)",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Open", value: "open" },
          { title: "Closed", value: "closed" },
          { title: "Sold out", value: "soldOut" },
        ],
        layout: "radio",
      },
      initialValue: "open",
    }),
    defineField({
      name: "bakersNote",
      title: "Baker's note",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "featuredProducts",
      title: "Featured products (homepage)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      validation: (rule) => rule.max(4),
    }),
  ],
});
