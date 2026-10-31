import { createClient } from "next-sanity";
import { isSanityConfigured, sanityDataset, sanityProjectId } from "./env";
import { sanityApiVersion } from "./client";

/** Published reads that must not lag behind inventory or drop-status writes. */
export const sanityFreshClient = createClient({
  projectId: sanityProjectId ?? "placeholder",
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: false,
  token: isSanityConfigured ? process.env.SANITY_API_READ_TOKEN : undefined,
  stega: {
    enabled: false,
  },
});
