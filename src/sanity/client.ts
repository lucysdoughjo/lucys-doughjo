import { createClient } from "next-sanity";
import { isSanityConfigured, sanityDataset, sanityProjectId } from "./env";

export const sanityApiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01";

export const sanityClient = createClient({
  projectId: sanityProjectId ?? "placeholder",
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: isSanityConfigured,
  token: process.env.SANITY_API_READ_TOKEN,
  stega: {
    enabled: false,
  },
});
