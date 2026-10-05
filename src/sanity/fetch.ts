import { cache } from "react";
import { aboutDefaults } from "@/lib/about-defaults";
import {
  homeDefaults,
  placeholderEvents,
  placeholderFeaturedProducts,
} from "@/lib/home-defaults";
import type { PortableTextBlock } from "next-sanity";
import { getPlaceholderProductBySlug } from "@/lib/shop-catalog";
import {
  getOrderWindowState,
  type DropStatus,
  type OrderWindowState,
} from "@/lib/order-window";
import type { PurchaseOption } from "@/lib/pricing";
import { isSanityConfigured } from "./env";
import { urlForImage } from "./image";
import { mapSanityProduct } from "./map-product";
import { sanityClient } from "./client";
import {
  aboutPageQuery,
  allUpcomingEventsQuery,
  homePageQuery,
  latestWeeklyDropQuery,
  siteSettingsQuery,
  faqItemsQuery,
  upcomingEventsQuery,
} from "./queries";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const placeholderFaqItems: FaqItem[] = [
  {
    id: "faq-preorder",
    question: "How does weekly preorder work?",
    answer:
      "Orders open Monday and close Wednesday at 8 PM Pacific. We bake Saturday and fulfill on Sunday via pickup or local delivery.",
  },
  {
    id: "faq-cutoff",
    question: "What happens if I miss the cutoff?",
    answer:
      "You'll need to wait until the next Monday when the new drop opens. The shop stays visible so you can browse what's coming.",
  },
  {
    id: "faq-delivery",
    question: "Do you deliver?",
    answer:
      "Yes — on Sundays within the ZIP codes listed at checkout. Delivery fee and eligible areas are set in site settings.",
  },
  {
    id: "faq-pickup-vs-delivery",
    question: "What's the difference between Sunday pickup and delivery?",
    answer:
      "Both are part of the weekly Dough Drop after we bake on Saturday. Pickup is at the address shown at checkout; delivery is available on Sundays within the ZIP codes we serve.",
  },
  {
    id: "faq-allergens",
    question: "How do you handle allergens?",
    answer:
      "Allergens are listed on each product when they apply. We bake in a home kitchen that handles wheat, dairy, eggs, and nuts — reach out before ordering if you have severe allergies.",
  },
  {
    id: "faq-sold-out",
    question: "How will I know if something is sold out?",
    answer:
      "Sold-out items are marked on the shop and product pages and can't be added to cart. If the whole drop closes early, the banner at the top of the site will show that ordering is closed.",
  },
  {
    id: "faq-cottage-food",
    question: "Is this a licensed commercial bakery?",
    answer:
      "Lucy's Doughjo operates as a California cottage food microbakery. Products are made in a home kitchen and are not subject to routine health department inspection.",
  },
];

export type FeaturedProduct = {
  id: string;
  slug: string;
  name: string;
  priceLabel: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  purchaseOptions: PurchaseOption[];
  soldOut: boolean;
};

export type HomePageContent = {
  heroHeadline: string;
  heroBody: string;
  scriptAccent: string;
  heroImageUrl: string;
  heroImageAlt: string;
  storyTitle: string;
  storyTeaser: string;
  storyImageUrl: string;
  storyImageAlt: string;
  findUsIntro: string;
  dropSectionDescription: string;
  bakersNote: string | null;
};

export type UpcomingEvent = {
  id: string;
  label: string;
  summary: string;
};

export type DetailedUpcomingEvent = {
  id: string;
  name: string;
  dateLabel: string;
  timeRange: string;
  location: string;
  note: string | null;
};

export type AboutPageContent = {
  title: string;
  body: PortableTextBlock[];
  images: { url: string; alt: string }[];
};

export type SiteContactSettings = {
  contactEmail: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
};

const defaultContactSettings: SiteContactSettings = {
  contactEmail: "hello@lucysdoughjo.com",
  instagramUrl: null,
  facebookUrl: null,
};

type SiteSettingsRecord = {
  contactEmail?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  forceClosed?: boolean;
  customOpenAt?: string | null;
  customCloseAt?: string | null;
};

type WeeklyDropRecord = {
  status?: DropStatus;
  bakersNote?: string | null;
  products?: Array<{
    _id?: string;
    name?: string;
    slug?: string;
    description?: string;
    priceCents?: number;
    unitsPerItem?: number;
    unitLabel?: string;
    priceTiers?: { quantity: number; priceCents: number; label?: string }[];
    soldOut?: boolean;
    availableThisWeek?: boolean;
    image?: { asset?: unknown; alt?: string };
  }> | null;
};

function todayPacificYmd(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

function formatEventLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12));
  return utcDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatEventSummary(event: {
  name: string;
  location: string;
  startTime?: string | null;
  endTime?: string | null;
}) {
  const time = formatEventTimeRange(event.startTime, event.endTime);
  return [event.name, event.location, time].filter(Boolean).join(" · ");
}

function formatEventTimeRange(
  startTime?: string | null,
  endTime?: string | null,
) {
  if (startTime && endTime) {
    return `${startTime} – ${endTime}`;
  }
  return startTime || "";
}

function mapDetailedEvent(event: {
  _id: string;
  date: string;
  name: string;
  location: string;
  startTime?: string | null;
  endTime?: string | null;
  note?: string | null;
}): DetailedUpcomingEvent {
  return {
    id: event._id,
    name: event.name,
    dateLabel: formatEventLabel(event.date),
    timeRange: formatEventTimeRange(event.startTime, event.endTime),
    location: event.location,
    note: event.note?.trim() || null,
  };
}

const placeholderDetailedEvents: DetailedUpcomingEvent[] = [
  {
    id: "placeholder-1",
    name: "Chino Farmers Market",
    dateLabel: "Sat, Sep 20",
    timeRange: "8:00 AM – 1:00 PM",
    location: "Chino, CA",
    note: null,
  },
  {
    id: "placeholder-2",
    name: "Pop-up — Chino Hills",
    dateLabel: "Sun, Sep 28",
    timeRange: "9:00 AM – 12:00 PM",
    location: "Chino Hills, CA",
    note: null,
  },
];

const fetchSiteSettings = cache(async (): Promise<SiteSettingsRecord | null> => {
  if (!isSanityConfigured) return null;
  try {
    return await sanityClient.fetch(siteSettingsQuery);
  } catch {
    return null;
  }
});

const fetchLatestWeeklyDrop = cache(async (): Promise<WeeklyDropRecord | null> => {
  if (!isSanityConfigured) return null;
  try {
    return await sanityClient.fetch(latestWeeklyDropQuery);
  } catch {
    return null;
  }
});

export const getOrderWindowForSite = cache(async (
  now = new Date(),
): Promise<OrderWindowState> => {
  const [settings, drop] = await Promise.all([
    fetchSiteSettings(),
    fetchLatestWeeklyDrop(),
  ]);

  return getOrderWindowState(now, {
    forceClosed: settings?.forceClosed,
    customOpenAt: settings?.customOpenAt,
    customCloseAt: settings?.customCloseAt,
    dropStatus: drop?.status ?? null,
  });
});

export const getHomePageContent = cache(async (): Promise<HomePageContent> => {
  const drop = await fetchLatestWeeklyDrop();

  if (!isSanityConfigured) {
    return {
      heroHeadline: homeDefaults.heroHeadline,
      heroBody: homeDefaults.heroBody,
      scriptAccent: homeDefaults.scriptAccent,
      heroImageUrl: homeDefaults.heroImageSrc,
      heroImageAlt: homeDefaults.heroImageAlt,
      storyTitle: homeDefaults.storyTitle,
      storyTeaser: homeDefaults.storyTeaser,
      storyImageUrl: homeDefaults.storyImageSrc,
      storyImageAlt: homeDefaults.storyImageAlt,
      findUsIntro: homeDefaults.findUsIntro,
      dropSectionDescription: homeDefaults.dropSectionDescription,
      bakersNote: drop?.bakersNote ?? null,
    };
  }

  try {
    const page = await sanityClient.fetch(homePageQuery);

    return {
      heroHeadline: page?.heroHeadline || homeDefaults.heroHeadline,
      heroBody: page?.heroBody || homeDefaults.heroBody,
      scriptAccent: page?.scriptAccent || homeDefaults.scriptAccent,
      heroImageUrl: page?.heroImage?.asset
        ? urlForImage(page.heroImage).width(1200).height(960).fit("crop").url()
        : homeDefaults.heroImageSrc,
      heroImageAlt:
        page?.heroImage?.alt || homeDefaults.heroImageAlt,
      storyTitle: page?.storyTitle || homeDefaults.storyTitle,
      storyTeaser: page?.storyTeaser || homeDefaults.storyTeaser,
      storyImageUrl: page?.storyImage?.asset
        ? urlForImage(page.storyImage).width(900).height(675).fit("crop").url()
        : homeDefaults.storyImageSrc,
      storyImageAlt:
        page?.storyImage?.alt || homeDefaults.storyImageAlt,
      findUsIntro: page?.findUsIntro || homeDefaults.findUsIntro,
      dropSectionDescription: homeDefaults.dropSectionDescription,
      bakersNote: drop?.bakersNote ?? null,
    };
  } catch {
    return {
      heroHeadline: homeDefaults.heroHeadline,
      heroBody: homeDefaults.heroBody,
      scriptAccent: homeDefaults.scriptAccent,
      heroImageUrl: homeDefaults.heroImageSrc,
      heroImageAlt: homeDefaults.heroImageAlt,
      storyTitle: homeDefaults.storyTitle,
      storyTeaser: homeDefaults.storyTeaser,
      storyImageUrl: homeDefaults.storyImageSrc,
      storyImageAlt: homeDefaults.storyImageAlt,
      findUsIntro: homeDefaults.findUsIntro,
      dropSectionDescription: homeDefaults.dropSectionDescription,
      bakersNote: drop?.bakersNote ?? null,
    };
  }
});

export const getFeaturedProducts = cache(async (): Promise<FeaturedProduct[]> => {
  const drop = await fetchLatestWeeklyDrop();
  const products = drop?.products;

  if (!Array.isArray(products) || products.length === 0) {
    return placeholderFeaturedProducts.map((p) => {
      const full = getPlaceholderProductBySlug(p.slug);
      return {
        id: p.name,
        slug: p.slug,
        name: p.name,
        priceLabel: full?.priceLabel ?? p.priceLabel,
        description: p.description,
        imageUrl: p.imageSrc,
        imageAlt: p.imageAlt,
        purchaseOptions: full?.purchaseOptions ?? [],
        soldOut: p.soldOut,
      };
    });
  }

  return products
    .filter((p) => p?.availableThisWeek !== false && p?.name && p?.description)
    .slice(0, 4)
    .map((p) => {
      const mapped = mapSanityProduct({
        ...p,
        category: { name: "Menu", slug: "artisan-sourdough" },
      });
      if (!mapped) return null;

      return {
        id: mapped.id,
        slug: mapped.slug,
        name: mapped.name,
        priceLabel: mapped.priceLabel,
        description: mapped.description,
        imageUrl: mapped.imageUrl,
        imageAlt: mapped.imageAlt,
        purchaseOptions: mapped.purchaseOptions,
        soldOut: mapped.soldOut,
      };
    })
    .filter((p): p is FeaturedProduct => p !== null);
});

export const getUpcomingEvents = cache(async (): Promise<UpcomingEvent[]> => {
  if (!isSanityConfigured) {
    return placeholderEvents.map((e) => ({ ...e }));
  }

  try {
    const events = await sanityClient.fetch(upcomingEventsQuery, {
      today: todayPacificYmd(),
    });

    if (!Array.isArray(events) || events.length === 0) {
      return placeholderEvents.map((e) => ({ ...e }));
    }

    return events.map(
      (event: {
        _id: string;
        date: string;
        name: string;
        location: string;
        startTime?: string;
        endTime?: string;
      }) => ({
        id: event._id,
        label: formatEventLabel(event.date),
        summary: formatEventSummary(event),
      }),
    );
  } catch {
    return placeholderEvents.map((e) => ({ ...e }));
  }
});

export const getSiteContactSettings = cache(
  async (): Promise<SiteContactSettings> => {
    if (!isSanityConfigured) {
      return defaultContactSettings;
    }

    try {
      const settings = await fetchSiteSettings();
      return {
        contactEmail:
          settings?.contactEmail?.trim() || defaultContactSettings.contactEmail,
        instagramUrl: settings?.instagramUrl?.trim() || null,
        facebookUrl: settings?.facebookUrl?.trim() || null,
      };
    } catch {
      return defaultContactSettings;
    }
  },
);

export const getAboutPageContent = cache(async (): Promise<AboutPageContent> => {
  if (!isSanityConfigured) {
    return {
      title: aboutDefaults.title,
      body: aboutDefaults.body,
      images: aboutDefaults.images.map((image) => ({ ...image })),
    };
  }

  try {
    const page = await sanityClient.fetch(aboutPageQuery);

    const images =
      Array.isArray(page?.images) && page.images.length > 0
        ? page.images
            .filter((image: { asset?: unknown }) => image?.asset)
            .map((image: { asset?: unknown; alt?: string }) => ({
              url: urlForImage(image).width(900).height(675).fit("crop").url(),
              alt: image.alt || "Lucy's Doughjo bakery",
            }))
        : aboutDefaults.images.map((image) => ({ ...image }));

    const body =
      Array.isArray(page?.body) && page.body.length > 0
        ? (page.body as PortableTextBlock[])
        : aboutDefaults.body;

    return {
      title: page?.title?.trim() || aboutDefaults.title,
      body,
      images,
    };
  } catch {
    return {
      title: aboutDefaults.title,
      body: aboutDefaults.body,
      images: aboutDefaults.images.map((image) => ({ ...image })),
    };
  }
});

export const getAllUpcomingEvents = cache(
  async (): Promise<DetailedUpcomingEvent[]> => {
    if (!isSanityConfigured) {
      return placeholderDetailedEvents.map((event) => ({ ...event }));
    }

    try {
      const events = await sanityClient.fetch(allUpcomingEventsQuery, {
        today: todayPacificYmd(),
      });

      if (!Array.isArray(events) || events.length === 0) {
        return placeholderDetailedEvents.map((event) => ({ ...event }));
      }

      return events.map(mapDetailedEvent);
    } catch {
      return placeholderDetailedEvents.map((event) => ({ ...event }));
    }
  },
);

export const getFaqItems = cache(async (): Promise<FaqItem[]> => {
  if (!isSanityConfigured) {
    return placeholderFaqItems;
  }

  try {
    const items = await sanityClient.fetch(faqItemsQuery);
    if (!Array.isArray(items) || items.length === 0) {
      return placeholderFaqItems;
    }

    return items.map(
      (item: { _id: string; question: string; answer: string }) => ({
        id: item._id,
        question: item.question,
        answer: item.answer,
      }),
    );
  } catch {
    return placeholderFaqItems;
  }
});
