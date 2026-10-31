import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripeServerClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }

  return stripeSingleton;
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}
