import type { Metadata } from "next";

export const SITE_NAME = "Lucy's Doughjo";

export const DEFAULT_DESCRIPTION =
  "Microbakery in Chino, CA — small-batch sourdough and baked treats. Preorder the Sunday Dough Drop for pickup or local delivery.";

export const DEFAULT_KEYWORDS = [
  "Lucy's Doughjo",
  "Chino bakery",
  "sourdough bread",
  "microbakery",
  "Sunday Dough Drop",
  "artisan bread",
  "cinnamon rolls",
  "local bakery California",
];

export const DEFAULT_OG_IMAGE_PATH =
  "/assets/homepage_hero/homepage-hero-artisan-sourdough.jpeg";

export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://lucydoughjo.com";
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return new URL(withProtocol.replace(/\/$/, ""));
}

export function absoluteUrl(path: string): string {
  return new URL(path.startsWith("/") ? path : `/${path}`, getSiteUrl()).href;
}

type PageMetadataInput = {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  ogImage?: string | null;
  robots?: Metadata["robots"];
};

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = "/",
  ogImage = DEFAULT_OG_IMAGE_PATH,
  robots,
}: PageMetadataInput = {}): Metadata {
  const url = absoluteUrl(path);
  const imagePath = ogImage ?? DEFAULT_OG_IMAGE_PATH;
  const imageUrl =
    imagePath.startsWith("http://") || imagePath.startsWith("https://")
      ? imagePath
      : absoluteUrl(imagePath);
  const images = imagePath ? [{ url: imageUrl }] : undefined;

  const openGraphTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;

  return {
    ...(title ? { title } : {}),
    description,
    keywords,
    ...(robots ? { robots } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: openGraphTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description,
      ...(images ? { images: images.map((img) => img.url) } : {}),
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  icons: {
    icon: "/assets/icons/wheat-icon.png",
    apple: "/assets/icons/wheat-icon.png",
  },
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    url: getSiteUrl(),
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE_PATH) }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
  },
};
