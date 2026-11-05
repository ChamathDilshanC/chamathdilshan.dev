import { describe, expect, it } from "vitest";

import { TAG, TTL, paper, post, project } from "../lib/cache-tags";

/**
 * These tags are a contract with the backend: it invalidates by the exact same
 * strings (CACHING.md §10.1). A rename here silently breaks invalidation, so
 * the shape is asserted rather than assumed.
 */
describe("cache tags", () => {
  it("scopes entity tags by slug", () => {
    expect(project("aegiszero")).toBe("project:aegiszero");
    expect(post("building-a-zero-trust-platform")).toBe(
      "post:building-a-zero-trust-platform",
    );
    expect(paper("zero-trust-identity-management")).toBe(
      "research:zero-trust-identity-management",
    );
  });

  it("keeps the collection tag names the backend expects", () => {
    expect(TAG).toMatchObject({
      content: "content",
      profile: "profile",
      projects: "projects",
      blog: "blog",
      research: "research",
      skills: "skills",
      experience: "experience",
    });
  });
});

describe("TTL matrix", () => {
  it("matches the windows documented in CACHING.md §7", () => {
    expect(TTL.stable).toBe(86_400);
    expect(TTL.content).toBe(3_600);
    expect(TTL.search).toBe(60);
  });

  it("never caches longer for volatile content than for stable content", () => {
    expect(TTL.search).toBeLessThan(TTL.list);
    expect(TTL.list).toBeLessThan(TTL.content);
    expect(TTL.content).toBeLessThan(TTL.stable);
  });
});
