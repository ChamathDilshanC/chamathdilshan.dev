/**
 * theSVG (https://thesvg.org): open brand icons, served as static SVGs.
 *
 * There is no search API. The catalog is one JSON manifest that is fetched
 * once and filtered in memory, and an icon is rendered straight from its CDN
 * URL by slug (https://thesvg.org/docs/tricks).
 */

export const THESVG = "https://thesvg.org";
export const REGISTRY_URL = `${THESVG}/api/registry.json`;

/** One catalog entry, as served by /api/registry.json. */
export type TheSvgIcon = {
  slug: string;
  title: string;
  aliases: string[];
  categories: string[];
  hex: string;
  /** Variant keys this icon ships, e.g. ["default", "mono", "light", "dark", "wordmark"]. */
  variants: string[];
};

export type TheSvgRegistry = { total: number; icons: TheSvgIcon[] };

/** Variants that fit a small square slot, in the order they are offered. */
export const ICON_VARIANTS = ["default", "mono", "dark", "light"] as const;
export type IconVariant = (typeof ICON_VARIANTS)[number];

export const VARIANT_LABELS: Record<IconVariant, string> = {
  default: "Colour",
  mono: "Mono",
  dark: "Dark",
  light: "Light",
};

export const VARIANT_HINTS: Record<IconVariant, string> = {
  default: "The brand's own colours",
  mono: "One colour",
  dark: "Black, for light backgrounds",
  light: "White, for dark backgrounds",
};

/** CDN URL of an icon. */
export function iconUrl(slug: string, variant: string = "default"): string {
  return `${THESVG}/icons/${slug}/${variant}.svg`;
}

/** The slug and variant behind a theSVG icon URL, or null for any other URL. */
export function parseIconUrl(url: string | null | undefined): { slug: string; variant: string } | null {
  const match = url?.match(/^https:\/\/thesvg\.org\/icons\/([a-z0-9-]+)\/([A-Za-z0-9-]+)\.svg$/);
  return match?.[1] && match[2] ? { slug: match[1], variant: match[2] } : null;
}

/** "Next.js" -> "nextjs", "C#" -> "csharp", "C++" -> "cplusplus". */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/#/g, "sharp")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "");
}

// Cloud architecture sets (AWS, Azure, GCP, Kubernetes resources) share words
// with brand names ("PostgreSQL" -> "Azure Database PostgreSQL Server"), so
// they rank after brand icons.
const ARCHITECTURE = /^(aws|azure|gcp|google-cloud|k8s|kubernetes)-/;

/** Lower is better; null when the icon does not match at all. */
function rank(icon: TheSvgIcon, query: string, firstWord: string): number | null {
  const fields = [normalize(icon.title), ...icon.aliases.map(normalize), icon.slug.replace(/-/g, "")];
  let best = Number.POSITIVE_INFINITY;
  for (const field of fields) {
    if (field === query) best = Math.min(best, 0);
    else if (field.startsWith(query)) best = Math.min(best, 1);
    else if (field.includes(query)) best = Math.min(best, 3);
  }
  if (best > 2 && firstWord && icon.title.toLowerCase().split(/[^a-z0-9]+/).some((w) => w && w.startsWith(firstWord))) {
    best = 2;
  }
  if (!Number.isFinite(best)) return null;
  return ARCHITECTURE.test(icon.slug) ? best + 3 : best;
}

/**
 * Icons matching a name, best first: exact names, then names that start with
 * the query, then any word that does, then anything containing it. Ties go
 * to icons that ship a mono variant, then to shorter names.
 */
export function searchIcons(icons: readonly TheSvgIcon[], query: string, limit = 24): TheSvgIcon[] {
  const q = normalize(query);
  if (!q) return [];
  const firstWord = query.toLowerCase().trim().split(/[^a-z0-9#+]+/)[0] ?? "";
  return icons
    .flatMap((icon) => {
      const score = rank(icon, q, firstWord);
      return score === null ? [] : [{ icon, score }];
    })
    .sort(
      (a, b) =>
        a.score - b.score ||
        Number(b.icon.variants.includes("mono")) - Number(a.icon.variants.includes("mono")) ||
        a.icon.title.length - b.icon.title.length ||
        a.icon.title.localeCompare(b.icon.title),
    )
    .slice(0, limit)
    .map(({ icon }) => icon);
}
