import { Resend } from "resend";

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export function getFromEmailAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Lucy's Doughjo <onboarding@resend.dev>"
  );
}
