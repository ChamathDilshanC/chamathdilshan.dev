import { describe, expect, it } from "vitest";

import { technologyIcon } from "../lib/tech-icons";

describe("technology icons", () => {
  it.each([
    [".NET 8", "dotnet"],
    ["C#", "csharp"],
    ["FFmpeg", "ffmpeg"],
    ["Avalonia", "windows"],
    ["AWS SDK", "aws"],
    ["Tailwind CSS", "tailwind-css"],
    ["Java/Maven", "apache-maven"],
  ])("maps %s to the %s icon", (technology, slug) => {
    expect(technologyIcon(technology)).toBe(`https://thesvg.org/icons/${slug}/default.svg`);
  });

  it("keeps a generic renderer fallback for technologies without brand artwork", () => {
    expect(technologyIcon("DXGI")).toBeNull();
    expect(technologyIcon("WGC")).toBeNull();
  });
});
