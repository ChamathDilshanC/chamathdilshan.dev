import { beforeEach, describe, expect, it, vi } from "vitest";

describe("project reads", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.test");
  });

  it("bypasses the Next.js data cache so published changes render immediately", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify([{ slug: "cap-it-screen-recorder" }]), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetch);

    const { getProjects } = await import("../lib/content");
    await getProjects();

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.test/api/projects",
      expect.objectContaining({
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
    );
    expect(fetch.mock.calls[0]?.[1]).not.toHaveProperty("next");
  });
});
