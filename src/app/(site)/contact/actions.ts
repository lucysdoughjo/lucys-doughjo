"use server";

import { Resend } from "resend";
import { getSiteContactSettings } from "@/sanity/fetch";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const initialState: ContactFormState = { status: "idle" };

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
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      status: "error",
      message:
        "Email is not configured on this environment. Please use the contact links below.",
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
  const to = contactEmail?.trim();
  if (!to) {
    return {
      status: "error",
      message: "No contact email is set in site settings.",
    };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Lucy's Doughjo <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Contact from ${name} — Lucy's Doughjo`,
    text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
  });

  if (error) {
    return {
      status: "error",
      message: "We couldn't send your message. Please try again in a moment.",
    };
  }

  return { status: "success" };
}

export { initialState as contactFormInitialState };
