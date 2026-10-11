import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  menuCategories,
  menuProducts,
  toSanityProduct,
} from "./menu-products.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1).replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional when vars are exported in the shell
  }
}

loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || projectId === "your_project_id") {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local before seeding.",
  );
  process.exit(1);
}

if (!token) {
  console.error("Set SANITY_API_WRITE_TOKEN in .env.local before seeding.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

const categories = menuCategories;
const products = menuProducts.map(toSanityProduct);

function mondayOfCurrentWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

/** YYYY-MM-DD for a calendar day offset from today in Pacific time. */
function pacificDateOffset(daysFromToday) {
  const base = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
  );
  base.setDate(base.getDate() + daysFromToday);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const docs = [
  {
    _id: "siteSettings",
    _type: "siteSettings",
    contactEmail: "hello@lucysdoughjo.com",
    pickupAddress: "Chino, CA — pickup details TBD",
    pickupInstructions: "Sunday Dough Drop pickup instructions will go here.",
    deliveryZipCodes: ["91708", "91710", "91709"],
    deliveryFeeCents: 500,
    deliveryNotes: "Local delivery on Sundays within listed ZIP codes.",
    forceClosed: false,
  },
  {
    _id: "homePage",
    _type: "homePage",
    heroHeadline: "Real ingredients.\nMade to be shared.",
    heroBody:
      "Handcrafted sourdough and fresh baked treats, naturally leavened and small-batch baked in Chino, CA.",
    scriptAccent: "Baked for good company.",
    storyTitle: "A small-batch bakery",
    storyTeaser:
      "Lucy's Doughjo is a Chino microbakery built around simple ingredients, slow fermentation, and really good things made to be shared.",
    findUsIntro:
      "Catch us at local farmers markets, pop-ups, and events.",
  },
  {
    _id: "aboutPage",
    _type: "aboutPage",
    title: "Where joy meets the dough",
    body: [
      {
        _type: "block",
        _key: "about-seed-1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "about-seed-1-span",
            text: "Lucy's Doughjo is a Chino microbakery built around simple ingredients, slow fermentation, and really good things made to be shared.",
          },
        ],
      },
      {
        _type: "block",
        _key: "about-seed-2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "about-seed-2-span",
            text: "Every bake starts with time — a living starter, hand mixing, and small batches so nothing sits on a shelf waiting to be sold.",
          },
        ],
      },
      {
        _type: "block",
        _key: "about-seed-3",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "about-seed-3-span",
            text: "The Sunday Dough Drop is how we plan the week: you preorder, we bake on Saturday, and you pickup or receive delivery on Sunday.",
          },
        ],
      },
    ],
  },
  ...categories.map((c) => ({
    _id: c._id,
    _type: "category",
    name: c.name,
    slug: { _type: "slug", current: c.slug },
    sortOrder: c.sortOrder,
  })),
  ...products,
  {
    _id: "weeklyDrop-current",
    _type: "weeklyDrop",
    title: "This week's drop",
    weekStart: mondayOfCurrentWeek(),
    status: "open",
    bakersNote: "Thank you for preordering — we bake Saturday for Sunday pickup or delivery.",
    featuredProducts: products.map((p) => ({
      _type: "reference",
      _ref: p._id,
      _key: p._id,
    })),
  },
  {
    _id: "event-chino-farmers-market",
    _type: "event",
    name: "Chino Farmers Market",
    date: pacificDateOffset(14),
    startTime: "8:00 AM",
    endTime: "1:00 PM",
    location: "Chino, CA",
  },
  {
    _id: "event-chino-hills-popup",
    _type: "event",
    name: "Pop-up — Chino Hills",
    date: pacificDateOffset(28),
    startTime: "9:00 AM",
    endTime: "12:00 PM",
    location: "Chino Hills, CA",
  },
  {
    _id: "faq-preorder",
    _type: "faqItem",
    question: "How does weekly preorder work?",
    answer:
      "Orders open Monday and close Wednesday at 8 PM Pacific. We bake Saturday and fulfill on Sunday via pickup or local delivery.",
    order: 1,
  },
  {
    _id: "faq-cutoff",
    _type: "faqItem",
    question: "What happens if I miss the cutoff?",
    answer:
      "You'll need to wait until the next Monday when the new drop opens. The shop stays visible so you can browse what's coming.",
    order: 2,
  },
  {
    _id: "faq-delivery",
    _type: "faqItem",
    question: "Do you deliver?",
    answer:
      "Yes — on Sundays within the ZIP codes listed at checkout. Delivery fee and eligible areas are set in site settings.",
    order: 3,
  },
  {
    _id: "faq-pickup-vs-delivery",
    _type: "faqItem",
    question: "What's the difference between Sunday pickup and delivery?",
    answer:
      "Both are part of the weekly Dough Drop after we bake on Saturday. Pickup is at the address shown at checkout; delivery is available on Sundays within the ZIP codes we serve.",
    order: 4,
  },
  {
    _id: "faq-allergens",
    _type: "faqItem",
    question: "How do you handle allergens?",
    answer:
      "Allergens are listed on each product when they apply. We bake in a home kitchen that handles wheat, dairy, eggs, and nuts — reach out before ordering if you have severe allergies.",
    order: 5,
  },
  {
    _id: "faq-sold-out",
    _type: "faqItem",
    question: "How will I know if something is sold out?",
    answer:
      "Sold-out items are marked on the shop and product pages and can't be added to cart. If the whole drop closes early, the banner at the top of the site will show that ordering is closed.",
    order: 6,
  },
  {
    _id: "faq-cottage-food",
    _type: "faqItem",
    question: "Is this a licensed commercial bakery?",
    answer:
      "Lucy's Doughjo operates as a California cottage food microbakery. Products are made in a home kitchen and are not subject to routine health department inspection.",
    order: 7,
  },
];

console.log(`Seeding ${docs.length} documents into ${projectId}/${dataset}...`);

const transaction = client.transaction();
for (const doc of docs) {
  transaction.createOrReplace(doc);
}

await transaction.commit();

console.log("Seed complete. Open /studio to upload product photos and confirm prices.");
