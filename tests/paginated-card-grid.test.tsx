import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultPosts } from "@/content/posts";
import { defaultProjects } from "@/content/projects";
import type { Post, Project } from "@/lib/types/content";

const route = vi.hoisted(() => ({ query: "", pathname: "/blog" }));
vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(route.query),
}));
vi.mock("@/components/sections/card-grids", () => ({
  PostGrid: ({ posts }: { posts: Post[] }) => <div>{posts.map((post) => <a key={post.slug} href={`/blog/${post.slug}`}>{post.title}</a>)}</div>,
  WorkGrid: ({ projects }: { projects: Project[] }) => <div>{projects.map((project) => <a key={project.slug} href={`/projects/${project.slug}`}>{project.title}</a>)}</div>,
}));

import { PaginatedCardGrid } from "@/components/sections/paginated-card-grid";

describe("Reshaped listing pagination integration", () => {
  beforeEach(() => { route.query = ""; });

  it("hides controls for exactly six articles", () => {
    const posts = Array.from({ length: 6 }, (_, i) => ({ ...defaultPosts[0]!, slug: `post-${i}` }));
    const html = renderToStaticMarkup(<PaginatedCardGrid kind="journal" items={posts} />);
    expect(html.match(/<a /g)).toHaveLength(6);
    expect(html).not.toContain("Journal pagination");
  });

  it("renders the actual Reshaped controls once a seventh article exists", () => {
    const posts = Array.from({ length: 7 }, (_, i) => ({ ...defaultPosts[0]!, slug: `post-${i}` }));
    const html = renderToStaticMarkup(<PaginatedCardGrid kind="journal" items={posts} />);
    expect(html.match(/<a /g)).toHaveLength(6);
    expect(html).toContain('aria-label="Journal pagination"');
    expect(html).toContain('aria-label="Journal page 2"');
    expect(html).toContain("Showing 1–6 of 7 articles");
    expect(html).toContain("data-rs-root");
    expect(html).not.toContain('/blog/post-6"');
  });

  it("restores article page two from the URL and only shows its remaining item", () => {
    route.query = "page=2";
    const posts = Array.from({ length: 7 }, (_, i) => ({ ...defaultPosts[0]!, slug: `post-${i}` }));
    const html = renderToStaticMarkup(<PaginatedCardGrid kind="journal" items={posts} />);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('/blog/post-6"');
    expect(html).not.toContain('/blog/post-0"');
    expect(html).toContain("Showing 7–7 of 7 articles");
    expect(html).toContain('aria-label="Journal page 2" aria-current="true"');
  });

  it("uses the same six-item pages and correct labels for projects", () => {
    route.pathname = "/projects";
    route.query = "page=3";
    const projects = Array.from({ length: 13 }, (_, i) => ({ ...defaultProjects[0]!, slug: `project-${i}` }));
    const html = renderToStaticMarkup(<PaginatedCardGrid kind="projects" items={projects} />);
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('/projects/project-12"');
    expect(html).toContain("Showing 13–13 of 13 projects");
    expect(html).toContain('aria-label="Projects pagination"');
    expect(html).toContain('aria-label="Previous projects page"');
  });
});
