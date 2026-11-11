/**
 * Browser-side client for the admin API.
 *
 * The session cookie belongs to the API host and is HttpOnly, so every call
 * goes from the browser with `credentials: "include"`. Authorization is
 * enforced by the API on every request — nothing here is a security boundary.
 */

import { API_URL } from "@/lib/api";

export type FieldErrors = Record<string, string>;

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: FieldErrors = {},
    readonly detail: unknown = null,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

type PydanticError = { loc?: Array<string | number>; msg?: string };

function parseError(status: number, body: unknown): AdminApiError {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (Array.isArray(detail)) {
    const fieldErrors: FieldErrors = {};
    let first = "";
    for (const err of detail as PydanticError[]) {
      const loc = (err.loc ?? []).filter((part) => part !== "body");
      const msg = (err.msg ?? "Invalid value").replace(/^Value error, /, "");
      fieldErrors[loc.join(".")] = msg;
      if (!first) first = loc.length ? `${loc.join(" › ")}: ${msg}` : msg;
    }
    return new AdminApiError(status, first || "Some fields need attention.", fieldErrors, detail);
  }
  if (detail && typeof detail === "object" && "message" in detail) {
    return new AdminApiError(status, String((detail as { message: unknown }).message), {}, detail);
  }
  if (typeof detail === "string") return new AdminApiError(status, detail);
  return new AdminApiError(status, status >= 500 ? "The API had a problem. Try again." : `Request failed (${status}).`);
}

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

export async function adminFetch<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  if (!API_URL) throw new AdminApiError(0, "NEXT_PUBLIC_API_URL is not set.");
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      cache: "no-store",
      headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AdminApiError(0, "Cannot reach the API. Is it running?");
  }
  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw parseError(res.status, data);
  return data as T;
}

/** SWR fetcher. */
export const fetcher = <T>(path: string) => adminFetch<T>(path);

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong.";

/* --- response types ------------------------------------------------------- */

export type Me = { email: string; name: string; picture: string; expiresAt: string };

export type SectionSummary = {
  key: string;
  title: string;
  group: string;
  description: string;
  updatedAt: string | null;
};

export type SectionDetail = SectionSummary & { data: Record<string, unknown>; schema: JsonSchemaRoot };

export type MediaOut = {
  id: number;
  publicId: string;
  kind: "image" | "video";
  url: string;
  poster: string | null;
  format: string;
  width: number | null;
  height: number | null;
  bytes: number;
  duration: number | null;
  alt: string;
  originalFilename: string;
  createdAt: string;
};

export type MediaOrganizeOut = {
  moved: number;
  skipped: number;
  shared: number;
  failed: string[];
};

export type ProjectOut = {
  id: number;
  slug: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  thumbnail: { url: string; alt: string } | null;
  hero: { kind: "image" | "video"; url: string; alt: string; poster: string | null } | null;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  updatedAt: string;
  [key: string]: unknown;
};

export type PostOut = {
  id: number;
  slug: string;
  title: string;
  category: string;
  date: string;
  cover: { kind: "image" | "video"; url: string; alt: string; poster: string | null } | null;
  published: boolean;
  updatedAt: string;
  [key: string]: unknown;
};

export type SkillOut = {
  id: number;
  name: string;
  category: string;
  icon: string | null;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
};

export type ExperienceRoleOut = {
  title: string;
  employmentType: string;
  start: string;
  end: string | null;
  summary: string;
  highlights: string[];
  skills: string[];
};

export type ExperienceDocumentOut = {
  id: string;
  label: string;
  publicId: string;
  version: number;
  resourceType: "image" | "raw";
  format: "png";
  pages: number;
  bytes: number;
  originalFilename: string;
};

export type ExperienceOut = {
  id: number;
  company: string;
  companyUrl: string | null;
  logo: string | null;
  location: string;
  roles: ExperienceRoleOut[];
  documents: ExperienceDocumentOut[];
  published: boolean;
  updatedAt: string;
  [key: string]: unknown;
};

export type AuditEntry = { id: number; at: string; actor: string; action: string; target: string; ip: string };

export type Overview = {
  projects: number;
  projectsPublished: number;
  posts: number;
  postsPublished: number;
  skills: number;
  media: number;
  mediaConfigured: boolean;
  recent: AuditEntry[];
};

/* --- JSON Schema (the subset Pydantic emits) ------------------------------ */

export type JsonSchema = {
  type?: string | string[];
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  const?: unknown;
  format?: string;
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  minItems?: number;
  maxItems?: number;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  $ref?: string;
  widget?: string;
};

export type JsonSchemaRoot = JsonSchema & { $defs?: Record<string, JsonSchema> };
