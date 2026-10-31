import ContactAutoReplyEmail from "../../../emails/contact-auto-reply";
import ContactOwnerEmail from "../../../emails/contact-owner";
import { contactSubmissionHash } from "./idempotency";
import { getFromEmailAddress, getResendClient } from "./resend-client";

export type SendContactEmailsInput = {
  name: string;
  email: string;
  message: string;
  ownerEmail: string;
};

export type SendContactEmailsResult =
  | { ok: true }
  | { ok: false; message: string };

export async function sendContactEmails(
  input: SendContactEmailsInput,
): Promise<SendContactEmailsResult> {
  const resend = getResendClient();
  if (!resend) {
    return {
      ok: false,
      message:
        "Email is not configured on this environment. Please use the contact links below.",
    };
  }

  const from = getFromEmailAddress();
  const hash = contactSubmissionHash(input.name, input.email, input.message);

  const { error: ownerError } = await resend.emails.send(
    {
      from,
      to: input.ownerEmail,
      replyTo: input.email,
      subject: `Contact from ${input.name} — Lucy's Doughjo`,
      react: ContactOwnerEmail({
        customerName: input.name,
        customerEmail: input.email,
        message: input.message,
      }),
    },
    { idempotencyKey: `contact-owner/${hash}` },
  );

  if (ownerError) {
    return {
      ok: false,
      message: "We couldn't send your message. Please try again in a moment.",
    };
  }

  await resend.emails.send(
    {
      from,
      to: input.email,
      replyTo: input.ownerEmail,
      subject: "We received your message — Lucy's Doughjo",
      react: ContactAutoReplyEmail({
        customerName: input.name,
      }),
    },
    { idempotencyKey: `contact-reply/${hash}` },
  );

  return { ok: true };
}
