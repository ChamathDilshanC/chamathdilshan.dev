/**
 * Public site content, read from the API (and edited in the admin panel).
 *
 * Every getter is cached by Next.js under the tags in cache-tags.ts; the
 * backend calls /api/revalidate with those tags after each admin change, so
 * an edit shows up on the next visit.
 *
 * When the API cannot be reached, the bundled defaults in content/ are used.
 * Public pages must stay renderable during a transient API/database outage;
 * the API failure is still logged so it can be fixed independently.
 */

import { defaultExperience } from "@/content/experience";
import { defaultPosts } from "@/content/posts";
import { defaultProjects } from "@/content/projects";
import { defaultContent } from "@/content/site";
import { defaultSkills } from "@/content/skills";
import { ApiError, apiGet } from "@/lib/api";
import { TAG, TTL, post as postTag, project as projectTag } from "@/lib/cache-tags";
import type { Experience, Post, Project, SiteContent, Skill } from "@/lib/types/content";

const warned = new Set<string>();

function fallBackTo<T>(path: string, err: unknown, fallback: () => T): T {
  if (!warned.has(path)) {
    warned.add(path);
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[content] ${path} unavailable (${message}) — using bundled defaults`);
  }
  return fallback();
}

/**
 * A collection or the site content. Any failure — including a 404 from an API
 * deployed before these endpoints existed — counts as "unavailable".
 */
async function read<T>(
  path: string,
  tags: string[],
  revalidate: number,
  fallback: () => T,
  cache?: RequestCache,
): Promise<T> {
  try {
    return await apiGet<T>(path, cache ? { cache } : { revalidate, tags });
  } catch (err) {
    return fallBackTo(path, err, fallback);
  }
}

/** A single record: a 404 means "does not exist" and returns null. */
async function readOne<T>(path: string, tags: string[], revalidate: number, fallback: () => T | null): Promise<T | null> {
  try {
    return await apiGet<T>(path, { revalidate, tags });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    return fallBackTo(path, err, fallback);
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const data = await read<{ sections: Partial<SiteContent> }>("/api/content", [TAG.content], TTL.content, () => ({
    sections: defaultContent,
  }));
  // Sections the API does not know yet (newer frontend) keep their defaults.
  return {
    ...defaultContent,
    ...data.sections,
    site: {
      ...defaultContent.site,
      ...data.sections.site,
      email: defaultContent.site.email,
    },
  };
}

export async function getProjects(): Promise<Project[]> {
  return read("/api/projects", [TAG.projects], TTL.list, () => defaultProjects, "no-store");
}

export async function getProject(slug: string): Promise<Project | null> {
  return readOne(
    `/api/projects/${encodeURIComponent(slug)}`,
    [TAG.projects, projectTag(slug)],
    TTL.content,
    () => defaultProjects.find((p) => p.slug === slug) ?? null,
  );
}

export async function getPosts(): Promise<Post[]> {
  return read("/api/posts", [TAG.blog], TTL.blogList, () => defaultPosts);
}

export async function getPost(slug: string): Promise<Post | null> {
  return readOne(
    `/api/posts/${encodeURIComponent(slug)}`,
    [TAG.blog, postTag(slug)],
    TTL.content,
    () => defaultPosts.find((p) => p.slug === slug) ?? null,
  );
}

export async function getSkills(): Promise<Skill[]> {
  return read("/api/skills", [TAG.skills], TTL.content, () => defaultSkills);
}

/** Companies with their roles, most recent first. */
export async function getExperience(): Promise<Experience[]> {
  return read("/api/experience", [TAG.experience], TTL.content, () => defaultExperience);
}
