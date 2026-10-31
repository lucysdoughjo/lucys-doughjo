/**
 * Patch menu products in Sanity without replacing image/gallery fields.
 * Run: node scripts/sync-menu-sanity.mjs
 */
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
    // optional
  }
}

loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || projectId === "your_project_id") {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local before syncing.",
  );
  process.exit(1);
}

if (!token) {
  console.error("Set SANITY_API_WRITE_TOKEN in .env.local before syncing.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

const PATCH_FIELDS = [
  "name",
  "slug",
  "category",
  "description",
  "priceCents",
  "unitsPerItem",
  "unitLabel",
  "priceTiers",
  "availableThisWeek",
  "soldOut",
];

function pickPatchFields(doc) {
  const patch = {};
  for (const key of PATCH_FIELDS) {
    if (doc[key] !== undefined) patch[key] = doc[key];
  }
  return patch;
}

console.log(`Syncing menu into ${projectId}/${dataset}...`);

const tx = client.transaction();

for (const c of menuCategories) {
  tx.createIfNotExists({
    _id: c._id,
    _type: "category",
    name: c.name,
    slug: { _type: "slug", current: c.slug },
    sortOrder: c.sortOrder,
  });
}

for (const p of menuProducts) {
  const full = toSanityProduct(p);
  const patch = pickPatchFields(full);
  tx.createIfNotExists({ _id: full._id, _type: "product", ...patch });
  tx.patch(full._id, (builder) => {
    let b = builder.set(patch);
    if (!full.priceTiers) {
      b = b.unset(["priceTiers"]);
    }
    return b;
  });
}

const featuredRefs = menuProducts.map((p) => ({
  _type: "reference",
  _ref: p._id,
  _key: p._id,
}));

const dropId =
  (await client.fetch(`*[_type == "weeklyDrop"][0]._id`)) ??
  "weeklyDrop-current";

tx.patch(dropId, (builder) => builder.set({ featuredProducts: featuredRefs }));

await tx.commit();

console.log(
  "Menu sync complete. Existing product images in Studio were not modified.",
);
