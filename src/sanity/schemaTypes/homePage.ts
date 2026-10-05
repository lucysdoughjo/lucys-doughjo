import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
    }),
    defineField({
      name: "heroBody",
      title: "Hero body",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "storyTitle",
      title: "Story section title",
      type: "string",
    }),
    defineField({
      name: "storyImage",
      title: "Story section image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "findUsIntro",
      title: "Find us intro",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "scriptAccent",
      title: "Script accent",
      type: "string",
    }),
    defineField({
      name: "storyTeaser",
      title: "Story teaser",
      type: "text",
      rows: 3,
    }),
  ],
});
