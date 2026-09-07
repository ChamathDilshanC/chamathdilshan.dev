/**
 * The single server-side entry point to the FastAPI backend.
 * Every read goes through here so cache tags and revalidate windows stay
 * consistent.  See CACHING.md §8.1.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`API ${path} -> ${status}`);
    this.name = "ApiError";
  }
}

type CacheOpts = {
  /** Seconds before Next.js refetches. Use the TTL constants in cache-tags.ts. */
  revalidate?: number;
  /** Tags the backend can invalidate via POST /api/revalidate. */
  tags?: string[];
};

/** Cached public read. Never use for authenticated data. */
export async function apiGet<T>(path: string, cache: CacheOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: cache.revalidate ?? 3600, tags: cache.tags ?? [] },
  });
  if (!res.ok) throw new ApiError(res.status, path);
  return (await res.json()) as T;
}

/** Uncached read that returns null on 404 instead of throwing. */
export async function apiGetOptional<T>(
  path: string,
  cache: CacheOpts = {},
): Promise<T | null> {
  try {
    return await apiGet<T>(path, cache);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Authenticated request for the admin surface.
 * Always uncached and always forwards the session cookie.  (CACHING.md §15)
 */
export async function apiAdmin<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: { Accept: "application/json", ...init.headers },
  });
  if (!res.ok) throw new ApiError(res.status, path);
  return (await res.json()) as T;
}
