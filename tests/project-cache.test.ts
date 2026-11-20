import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultProjects } from "../content/projects";

describe("project reads", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  });

  it("uses tagged revalidation so public project pages can be cached", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify([{ slug: "cap-it-screen-recorder" }]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetch);

    const { getProjects } = await import("../lib/content");
    await getProjects();

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/api/projects",
      expect.objectContaining({
        headers: { Accept: "application/json" },
        next: { revalidate: 600, tags: ["projects"] },
      }),
    );
  });

  it("keeps production pages renderable when the API returns a server error", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response("Internal Server Error", { status: 500 }),
    );
    vi.stubGlobal("fetch", fetch);

    const { getProjects } = await import("../lib/content");

    await expect(getProjects()).resolves.toEqual(defaultProjects);
  });
});
