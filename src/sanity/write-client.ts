import { createClient } from "next-sanity";
import { isSanityConfigured, sanityDataset, sanityProjectId } from "./env";
import { sanityApiVersion } from "./client";

export function getSanityWriteToken(): string | null {
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  return token || null;
}

export function isSanityWriteConfigured(): boolean {
  return isSanityConfigured && Boolean(getSanityWriteToken());
}

export const sanityWriteClient = createClient({
  projectId: sanityProjectId ?? "placeholder",
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: false,
  token: getSanityWriteToken() ?? undefined,
});
