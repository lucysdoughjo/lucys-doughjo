export const homeDefaults = {
  heroHeadline: "Real ingredients.\nMade to be shared.",
  heroBody:
    "Handcrafted sourdough and fresh baked treats, naturally leavened and small-batch baked in Chino, CA.",
  scriptAccent: "Baked for good company.",
  heroImageSrc: "/assets/homepage_hero/homepage-hero-artisan-sourdough.jpg",
  heroImageAlt: "Handcrafted artisan sourdough loaf",
  storyTitle: "A small-batch bakery",
  storyTeaser:
    "Lucy's Doughjo is a Chino microbakery built around simple ingredients, slow fermentation, and really good things made to be shared.",
  storyImageSrc: "/assets/about/mixing-dough-by-hand.jpg",
  storyImageAlt: "Hands mixing dough in a bowl",
  findUsIntro:
    "Catch us at local farmers markets, pop-ups, and events.",
  dropSectionDescription:
    "Preorder while the window is open — we bake Saturday and deliver or pickup Sunday.",
} as const;

export const placeholderFeaturedProducts = [
  {
    slug: "jalapeno-cheddar",
    name: "Jalapeño Cheddar",
    priceLabel: "$16",
    description: "Naturally leavened sourdough with a savory kick.",
    imageSrc: "/assets/artisan_sourdough/artisan-loaf-dark-inclusion.jpg",
    imageAlt: "Sliced sourdough loaf with visible inclusions",
    soldOut: false,
  },
  {
    slug: "original-sourdough",
    name: "Original Sourdough",
    priceLabel: "$14",
    description: "Classic hand-shaped loaf with a golden crust.",
    imageSrc: "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
    imageAlt: "Round artisan sourdough loaf",
    soldOut: false,
  },
  {
    slug: "cinnamon-rolls",
    name: "Cinnamon Rolls",
    priceLabel: "$7 each · $25 for 4",
    description: "Soft, glazed, and baked for Sunday morning.",
    imageSrc: "/assets/cinnamon_rolls/cinnamon-rolls-glazed-primary.jpg",
    imageAlt: "Glazed cinnamon rolls",
    soldOut: false,
  },
  {
    slug: "blueberry-scones",
    name: "Blueberry Scones",
    priceLabel: "$4 each · 3 for $10",
    description: "Buttery scones with visible blueberry pockets.",
    imageSrc: "/assets/scones/blueberry-scone-primary.jpg",
    imageAlt: "Blueberry scone close-up",
    soldOut: false,
  },
] as const;

export const placeholderEvents = [
  {
    id: "placeholder-1",
    label: "Sat, Sep 20",
    summary: "Chino Farmers Market · 8 AM – 1 PM",
  },
  {
    id: "placeholder-2",
    label: "Sun, Sep 28",
    summary: "Pop-up · Chino Hills · 9 AM – 12 PM",
  },
] as const;
