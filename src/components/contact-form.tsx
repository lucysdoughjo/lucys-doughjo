"use client";

import { useActionState } from "react";
import { Button } from "@/components/button";
import { submitContactForm } from "@/app/(site)/contact/actions";
import {
  contactFormInitialState,
  type ContactFormState,
} from "@/app/(site)/contact/contact-form-state";

type ContactFormProps = {
  emailEnabled: boolean;
  contactEmail: string | null;
  instagramUrl: string | null;
};

export function ContactForm({
  emailEnabled,
  contactEmail,
  instagramUrl,
}: ContactFormProps) {
  const [state, formAction, pending] = useActionState<
    ContactFormState,
    FormData
  >(submitContactForm, contactFormInitialState);

  if (!emailEnabled) {
    return (
      <div className="mt-8 max-w-xl rounded-sm border border-espresso/10 bg-highlight/10 px-6 py-6">
        <p className="text-sm leading-relaxed text-foreground/80">
          The contact form is not wired on this environment. Reach out directly:
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {contactEmail ? (
            <li>
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {contactEmail}
              </a>
            </li>
          ) : null}
          {instagramUrl ? (
            <li>
              <a
                href={instagramUrl}
                className="font-medium text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 max-w-xl space-y-5">
      {state.status === "success" ? (
        <p
          className="rounded-sm border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          Thanks — your message is on its way. We&apos;ll reply as soon as we
          can.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p
          className="rounded-sm border border-red-600/30 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="mt-2 w-full rounded-sm border border-espresso/15 bg-cream px-4 py-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-sm border border-espresso/15 bg-cream px-4 py-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="mt-2 w-full resize-y rounded-sm border border-espresso/15 bg-cream px-4 py-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
