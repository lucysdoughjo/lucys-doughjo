import { createHash } from "node:crypto";
import {
  isSanityWriteConfigured,
  sanityWriteClient,
} from "@/sanity/write-client";

const hits = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const CHECKOUT_MAX_REQUESTS = 8;
const CONTACT_MAX_REQUESTS = 5;
const CART_MAX_REQUESTS = 20;
const RATE_LIMIT_RETRIES = 5;

export function isRateLimited(
  key: string,
  maxRequests: number,
  windowMs = WINDOW_MS,
): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > maxRequests;
}

async function consumeDurableRateLimit(
  key: string,
  maxRequests: number,
  failClosed: boolean,
): Promise<boolean> {
  if (!isSanityWriteConfigured()) {
    return isRateLimited(key, maxRequests);
  }

  const windowStart = Math.floor(Date.now() / WINDOW_MS);
  const hash = createHash("sha256").update(key).digest("hex").slice(0, 24);
  const id = `rateLimit.${hash}.${windowStart}`;

  for (let attempt = 0; attempt < RATE_LIMIT_RETRIES; attempt += 1) {
    const doc = await sanityWriteClient.getDocument(id);
    if (!doc) {
      try {
        await sanityWriteClient.create({
          _id: id,
          _type: "rateLimitBucket",
          count: 1,
          windowStart,
        });
        return false;
      } catch {
        continue;
      }
    }

    const count = Number(doc.count ?? 0);
    if (count >= maxRequests) {
      return true;
    }

    try {
      await sanityWriteClient
        .patch(id)
        .ifRevisionId(doc._rev)
        .set({ count: count + 1 })
        .commit();
      return false;
    } catch {
      // Revision conflict — retry with a fresh document.
    }
  }

  return failClosed;
}

export async function isCheckoutRateLimited(key: string): Promise<boolean> {
  return consumeDurableRateLimit(`checkout:${key}`, CHECKOUT_MAX_REQUESTS, true);
}

export async function isContactRateLimited(key: string): Promise<boolean> {
  return consumeDurableRateLimit(`contact:${key}`, CONTACT_MAX_REQUESTS, false);
}

export async function isCartRateLimited(key: string): Promise<boolean> {
  return consumeDurableRateLimit(`cart:${key}`, CART_MAX_REQUESTS, false);
}

export function clientIpFromHeaders(headerList: Headers): string {
  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const vercelForwarded = headerList.get("x-vercel-forwarded-for")?.trim();
  if (vercelForwarded) {
    return vercelForwarded.split(",")[0]?.trim() || "unknown";
  }

  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    return parts[parts.length - 1] || "unknown";
  }

  return "unknown";
}

export function clientIpFromRequest(request: Request): string {
  return clientIpFromHeaders(request.headers);
}
