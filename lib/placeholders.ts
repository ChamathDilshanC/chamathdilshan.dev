/**
 * Blurred previews for large images, inlined into the page as data URLs.
 *
 * Cloudinary renders each size and format of an image the first time anyone
 * asks for it, which can take over a second. Without a preview the dark page
 * background shows until the photo arrives; with one, a blurred version of
 * the photo paints immediately and sharpens when the real image lands.
 *
 * Server only. Image URLs are versioned, so each preview is fetched once and
 * then cached for good.
 */

import { placeholderUrl } from "./media";

const MAX_BYTES = 4_096;

/** A tiny JPEG of the image as a data URL, or null if there is none to be had. */
export async function placeholder(src: string | null | undefined): Promise<string | null> {
  const url = src ? placeholderUrl(src) : null;
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: false }, signal: AbortSignal.timeout(5_000) });
    if (!res.ok) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_BYTES) return null;
    return `data:image/jpeg;base64,${bytes.toString("base64")}`;
  } catch {
    // A missing preview only means the old behaviour: the image appears when it loads.
    return null;
  }
}

/** Previews keyed by image URL, for `<PlaceholderProvider>`. Images without one are left out. */
export async function placeholders(srcs: ReadonlyArray<string | null | undefined>): Promise<Record<string, string>> {
  const unique = [...new Set(srcs.filter((src): src is string => Boolean(src)))];
  const found = await Promise.all(unique.map(async (src) => [src, await placeholder(src)] as const));
  return Object.fromEntries(found.filter((entry): entry is readonly [string, string] => entry[1] !== null));
}

/** The `image` of every page section: the heroes and other large photos. */
export function sectionImages(content: Readonly<Record<string, unknown>>): string[] {
  return Object.values(content).flatMap((section) => {
    const image = (section as { image?: unknown } | null)?.image;
    return typeof image === "string" ? [image] : [];
  });
}
