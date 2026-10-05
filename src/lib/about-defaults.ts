import type { PortableTextBlock } from "next-sanity";

export type AboutStoryImage = {
  url: string;
  alt: string;
};

export const aboutDefaults = {
  title: "Where joy meets the dough",
  body: [
    {
      _type: "block",
      _key: "about-1",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "about-1-span",
          text: "Lucy's Doughjo is a Chino microbakery built around simple ingredients, slow fermentation, and really good things made to be shared.",
        },
      ],
    },
    {
      _type: "block",
      _key: "about-2",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "about-2-span",
          text: "Every bake starts with time — a living starter, hand mixing, and small batches so nothing sits on a shelf waiting to be sold.",
        },
      ],
    },
    {
      _type: "block",
      _key: "about-3",
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: "about-3-span",
          text: "The Sunday Dough Drop is how we plan the week: you preorder, we bake on Saturday, and you pickup or receive delivery on Sunday.",
        },
      ],
    },
  ] satisfies PortableTextBlock[],
  images: [
    {
      url: "/assets/about/mixing-dough-by-hand.jpg",
      alt: "Hands mixing dough in a bowl",
    },
    {
      url: "/assets/about/dough-proofing-basket.jpg",
      alt: "Dough proofing in a basket",
    },
    {
      url: "/assets/about/active-starter-detail.jpg",
      alt: "Active sourdough starter",
    },
    {
      url: "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
      alt: "Round artisan sourdough loaf",
    },
  ] satisfies AboutStoryImage[],
};
