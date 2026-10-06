export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export const contactFormInitialState: ContactFormState = { status: "idle" };
