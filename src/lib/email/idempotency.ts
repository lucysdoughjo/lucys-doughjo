import { createHash } from "crypto";

export function contactSubmissionHash(
  name: string,
  email: string,
  message: string,
): string {
  return createHash("sha256")
    .update(`${name}|${email}|${message}`)
    .digest("hex")
    .slice(0, 32);
}
