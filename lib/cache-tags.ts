/**
 * Cache tag vocabulary — must stay in sync with the backend's Redis tags.
 * See CACHING.md §10.1 (invalidation map).
 */

export const TAG = {
  content: "content",
  profile: "profile",
  taxonomy: "taxonomy",
  credentials: "credentials",
  settings: "settings",
  media: "media",
  projects: "projects",
  blog: "blog",
  research: "research",
} as const;

export const project = (slug: string) => `project:${slug}`;
export const post = (slug: string) => `post:${slug}`;
export const paper = (slug: string) => `research:${slug}`;

/** Revalidate windows in seconds — mirrors the TTL matrix in CACHING.md §7. */
export const TTL = {
  stable: 86_400,
  content: 3_600,
  list: 600,
  blogList: 600,
  search: 60,
} as const;
