/** Web-ready category lead images from the photography guide. */
export const categoryLeadImages: Record<
  string,
  { src: string; alt: string }
> = {
  "artisan-sourdough": {
    src: "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
    alt: "Round artisan sourdough loaf",
  },
  bagels: {
    src: "/assets/bagels/bagels-assorted-primary.jpg",
    alt: "Assorted bagels",
  },
  "english-muffins": {
    src: "/assets/english_muffins/english-muffins-primary.jpg",
    alt: "English muffins",
  },
  "cinnamon-rolls": {
    src: "/assets/cinnamon_rolls/cinnamon-rolls-glazed-primary.jpg",
    alt: "Glazed cinnamon rolls",
  },
  scones: {
    src: "/assets/scones/blueberry-scone-primary.jpg",
    alt: "Blueberry scone close-up",
  },
  "jumbo-cookies": {
    src: "/assets/jumbo_cookies/jumbo-cookies-primary.jpg",
    alt: "Jumbo cookies",
  },
};

export function getCategoryLeadImage(slug: string) {
  return (
    categoryLeadImages[slug] ?? {
      src: "/assets/artisan_sourdough/artisan-sourdough-primary.jpg",
      alt: "Fresh baked goods",
    }
  );
}
