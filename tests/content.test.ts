import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { defaultPosts } from "../content/posts";
import { defaultProjects } from "../content/projects";
import { defaultContent } from "../content/site";
import { defaultSkills } from "../content/skills";

const root = join(__dirname, "..");
const publicFile = (src: string) => join(root, "public", src);

/** Every string value in a content tree that looks like a local image path. */
function imagePaths(value: unknown): string[] {
  if (typeof value === "string") return value.startsWith("/images/") ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(imagePaths);
  if (value && typeof value === "object") return Object.values(value).flatMap(imagePaths);
  return [];
}

describe("default content", () => {
  it("uses unique slugs", () => {
    expect(new Set(defaultProjects.map((p) => p.slug)).size).toBe(defaultProjects.length);
    expect(new Set(defaultPosts.map((p) => p.slug)).size).toBe(defaultPosts.length);
  });

  it("points testimonials at real case studies", () => {
    const slugs = new Set(defaultProjects.map((p) => p.slug));
    for (const item of defaultContent["home.testimonials"].items) expect(slugs.has(item.project)).toBe(true);
  });

  it("only references images that exist in public/", () => {
    const paths = imagePaths([defaultContent, defaultProjects, defaultPosts, defaultSkills]);
    expect(paths.length).toBeGreaterThan(0);
    for (const src of paths) expect(existsSync(publicFile(src)), src).toBe(true);
  });

  it("links the navigation to existing routes", () => {
    for (const item of defaultContent.navigation.items) {
      const page = item.href === "/" ? "app/(public)/page.tsx" : `app/(public)${item.href}/page.tsx`;
      expect(existsSync(join(root, page)), item.href).toBe(true);
    }
  });

  it("lists every home block exactly once in the layout", () => {
    const blocks = defaultContent["home.layout"].sections.map((s) => s.section);
    expect(new Set(blocks).size).toBe(blocks.length);
    expect(blocks).toHaveLength(9);
  });

  it("gives every article valid dates and sections", () => {
    for (const post of defaultPosts) {
      expect(Number.isNaN(Date.parse(post.date)), post.slug).toBe(false);
      expect(post.sections.length).toBeGreaterThan(0);
    }
  });
});
