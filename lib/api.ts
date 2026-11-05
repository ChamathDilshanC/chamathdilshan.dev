/**
 * The single server-side entry point to the FastAPI backend.
 * Every read goes through here so cache tags and revalidate windows stay
 * consistent.  See CACHING.md §8.1.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

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
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: cache.revalidate ?? 3600, tags: cache.tags ?? [] },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new ApiError(res.status, path);
  return (await res.json()) as T;
}

/**
 * Read that returns null instead of throwing when the data is missing or the
 * backend is unreachable.
 *
 * Use this for anything rendered at build time: a prerender must not fail
 * because the API is briefly down. Pages that genuinely cannot render without
 * the data should use apiGet and let the error surface.
 */
export async function apiGetOptional<T>(path: string, cache: CacheOpts = {}): Promise<T | null> {
  try {
    return await apiGet<T>(path, cache);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 404) return null;
      console.warn(`[api] ${path} responded ${err.status} — rendering without it`);
      return null;
    }
    // Network / DNS / timeout — the backend is unreachable.
    console.warn(`[api] ${path} unreachable — rendering without it`);
    return null;
  }
}
