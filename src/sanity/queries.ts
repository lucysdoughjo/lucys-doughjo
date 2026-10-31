import { defineQuery } from "next-sanity";

export const latestWeeklyDropQuery = defineQuery(`
  *[_type == "weeklyDrop"] | order(weekStart desc)[0] {
    weekStart,
    status,
    bakersNote,
    "products": featuredProducts[]-> {
      _id,
      name,
      "slug": slug.current,
      description,
      priceCents,
      unitsPerItem,
      unitLabel,
      priceTiers[] {
        quantity,
        priceCents,
        label
      },
      weeklyLimit,
      unitsSoldThisWeek,
      unitsReservedThisWeek,
      soldOut,
      availableThisWeek,
      image {
        asset,
        alt
      },
      "category": category-> {
        name,
        "slug": slug.current
      }
    }
  }
`);

export const homePageQuery = defineQuery(`
  *[_type == "homePage"][0] {
    heroHeadline,
    heroBody,
    scriptAccent,
    storyTitle,
    storyTeaser,
    findUsIntro,
    heroImage {
      asset,
      alt
    },
    storyImage {
      asset,
      alt
    }
  }
`);

export const upcomingEventsQuery = defineQuery(`
  *[_type == "event" && date >= $today] | order(date asc)[0...3] {
    _id,
    name,
    date,
    startTime,
    endTime,
    location,
    note
  }
`);

export const allUpcomingEventsQuery = defineQuery(`
  *[_type == "event" && date >= $today] | order(date asc) {
    _id,
    name,
    date,
    startTime,
    endTime,
    location,
    note
  }
`);

export const aboutPageQuery = defineQuery(`
  *[_type == "aboutPage"][0] {
    title,
    body,
    images[] {
      asset,
      alt
    }
  }
`);

export const shopMenuQuery = defineQuery(`
  *[_type == "category"] | order(sortOrder asc) {
    _id,
    name,
    "slug": slug.current,
    blurb,
    leadImage {
      asset,
      alt
    },
    "products": *[
      _type == "product" &&
      references(^._id) &&
      availableThisWeek == true
    ] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      priceCents,
      unitsPerItem,
      unitLabel,
      priceTiers[] {
        quantity,
        priceCents,
        label
      },
      weeklyLimit,
      unitsSoldThisWeek,
      unitsReservedThisWeek,
      soldOut,
      availableThisWeek,
      allergens,
      image {
        asset,
        alt
      },
      gallery[] {
        asset,
        alt
      },
      "category": {
        "name": ^.name,
        "slug": ^.slug.current
      }
    }
  }
`);

export const productsBySlugsQuery = defineQuery(`
  *[_type == "product" && slug.current in $slugs] {
    _id,
    _rev,
    name,
    "slug": slug.current,
    description,
    priceCents,
    unitsPerItem,
    unitLabel,
    priceTiers[] {
      quantity,
      priceCents,
      label
    },
    weeklyLimit,
    unitsSoldThisWeek,
    unitsReservedThisWeek,
    soldOut,
    availableThisWeek,
    allergens,
    image {
      asset,
      alt
    },
    gallery[] {
      asset,
      alt
    },
    "category": category-> {
      name,
      "slug": slug.current
    }
  }
`);

export const productBySlugQuery = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    priceCents,
    unitsPerItem,
    unitLabel,
    priceTiers[] {
      quantity,
      priceCents,
      label
    },
    weeklyLimit,
    unitsSoldThisWeek,
    unitsReservedThisWeek,
    soldOut,
    availableThisWeek,
    allergens,
    image {
      asset,
      alt
    },
    gallery[] {
      asset,
      alt
    },
    "category": category-> {
      name,
      "slug": slug.current
    }
  }
`);

export const productSlugsQuery = defineQuery(`
  *[_type == "product" && defined(slug.current) && availableThisWeek == true] {
    "slug": slug.current
  }
`);

export const faqItemsQuery = defineQuery(`
  *[_type == "faqItem"] | order(order asc) {
    _id,
    question,
    answer,
    order
  }
`);

export const stalePendingOrdersQuery = defineQuery(`
  *[_type == "order" && status == "pending" && _createdAt < $cutoff] {
    _id,
    stripePaymentIntentId,
    reservationUnits
  }
`);

export const orderByPaymentIntentQuery = defineQuery(`
  *[_type == "order" && stripePaymentIntentId == $paymentIntentId][0] {
    _id,
    orderNumber,
    status,
    weekStart,
    customerName,
    customerEmail,
    customerPhone,
    fulfillment,
    fulfillmentAddress,
    fulfillmentInstructions,
    orderNotes,
    items,
    subtotalCents,
    deliveryFeeCents,
    totalCents,
    stripePaymentIntentId,
    emailsSentAt,
    reservationUnits
  }
`);

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings"][0] {
    contactEmail,
    instagramUrl,
    facebookUrl,
    pickupAddress,
    pickupInstructions,
    deliveryZipCodes,
    deliveryFeeCents,
    deliveryNotes,
    forceClosed,
    customOpenAt,
    customCloseAt
  }
`);
