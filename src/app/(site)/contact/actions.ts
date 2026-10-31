"use server";

import { headers } from "next/headers";
import type { ContactFormState } from "@/app/(site)/contact/contact-form-state";
import {
  clientIpFromHeaders,
  isContactRateLimited,
} from "@/lib/checkout/rate-limit";
import { sendContactEmails } from "@/lib/email";
import { getSiteContactSettings } from "@/sanity/fetch";

function cleanField(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, maxLength);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const ip = clientIpFromHeaders(await headers());
  if (await isContactRateLimited(ip)) {
    return {
      status: "error",
      message: "Too many messages. Please wait a minute and try again.",
    };
  }

  const name = cleanField(formData.get("name"), 120);
  const email = cleanField(formData.get("email"), 254);
  const message = cleanField(formData.get("message"), 4000);

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in name, email, and message." };
  }

  if (!isValidEmail(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const { contactEmail } = await getSiteContactSettings();
  const ownerEmail = contactEmail?.trim();
  if (!ownerEmail) {
    return {
      status: "error",
      message: "No contact email is set in site settings.",
    };
  }

  const result = await sendContactEmails({
    name,
    email,
    message,
    ownerEmail,
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  return { status: "success" };
}
