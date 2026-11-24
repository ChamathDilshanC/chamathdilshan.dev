import { describe, expect, it } from "vitest";
import { youtubeEmbedUrl } from "@/lib/youtube";

describe("youtubeEmbedUrl", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
  ])("normalizes %s", (url) => {
    expect(youtubeEmbedUrl(url)).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    );
  });

  it("rejects non-YouTube and malformed links", () => {
    expect(youtubeEmbedUrl("https://example.com/video")).toBeNull();
    expect(youtubeEmbedUrl("not a url")).toBeNull();
  });
});
