/**
 * Browser-side client for the contact form. The API validates the message and
 * emails it to the owner through Resend, with the visitor as Reply-To.
 */

import { API_URL } from "@/lib/api";

export type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  category: string;
  message: string;
  /** Honeypot. Real visitors leave it empty; the API drops anything that fills it in. */
  website: string;
};

export type ContactField = "firstName" | "lastName" | "email" | "category";

export class ContactError extends Error {
  constructor(
    message: string,
    /** The form field the API rejected, when it named one. */
    readonly field: ContactField | null = null,
  ) {
    super(message);
    this.name = "ContactError";
  }
}

const FIELDS: readonly string[] = ["firstName", "lastName", "email", "category"];

/** Turns an API error response into a ContactError the form can show. */
export function contactError(status: number, body: unknown): ContactError {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (status === 422 && Array.isArray(detail)) {
    for (const err of detail as Array<{ loc?: unknown[] }>) {
      const field = String(err.loc?.at(-1) ?? "");
      if (FIELDS.includes(field)) return new ContactError("Some details need another look.", field as ContactField);
    }
    return new ContactError("Some details need another look.");
  }
  if (typeof detail === "string" && detail) return new ContactError(detail);
  return new ContactError("Your message could not be sent. Try again shortly.");
}

export async function sendContactMessage(payload: ContactPayload, fetchImpl: typeof fetch = fetch): Promise<void> {
  if (!API_URL) throw new ContactError("The contact form is not connected yet.");
  let res: Response;
  try {
    res = await fetchImpl(`${API_URL}/api/contact`, {
      method: "POST",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new ContactError("Cannot reach the server. Check your connection and try again.");
  }
  if (res.ok) return;
  throw contactError(res.status, await res.json().catch(() => null));
}
