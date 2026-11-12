import { describe, expect, it } from "vitest";

import { technologyIcon } from "../lib/tech-icons";
import {
  iconUrl,
  normalize,
  parseIconUrl,
  searchIcons,
  type TheSvgIcon,
} from "../lib/thesvg";

const icon = (
  slug: string,
  title: string,
  variants = ["default", "mono"],
  aliases: string[] = [],
): TheSvgIcon => ({
  slug,
  title,
  aliases,
  categories: [],
  hex: "000000",
  variants,
});

// A slice of the real catalog, including the look-alikes that crowd searches.
const catalog = [
  icon("nextjs", "Next.js", ["default", "wordmark"]),
  icon("nextdotjs", "Next.js", ["default", "mono", "wordmark"]),
  icon("nextcloud", "Nextcloud"),
  icon("postgresql-badge", "PostgreSQL", ["default"]),
  icon("azure-arc-postgresql", "Arc PostgreSQL", ["default"]),
  icon("postgresql", "PostgreSQL"),
  icon("databasus", "Databasus", ["default"], ["postgres backup"]),
  icon("aws-aws-iq", "AWS IQ", ["default"]),
  icon("nova-aws", "Nova AWS", ["default"]),
  icon("aws", "AWS", ["default", "mono"]),
  icon("csharp", "C#"),
  icon("c", "C"),
  icon("tailwind-css", "Tailwind CSS"),
  icon("react", "React"),
  icon("preact", "Preact"),
  icon("react-query", "React Query"),
];

const slugs = (query: string) => searchIcons(catalog, query).map((i) => i.slug);

describe("theSVG", () => {
  it("builds and reads icon URLs", () => {
    expect(iconUrl("fastapi")).toBe(
      "https://thesvg.org/icons/fastapi/default.svg",
    );
    expect(iconUrl("react", "mono")).toBe(
      "https://thesvg.org/icons/react/mono.svg",
    );
    expect(
      parseIconUrl("https://thesvg.org/icons/tailwind-css/wordmarkDark.svg"),
    ).toEqual({
      slug: "tailwind-css",
      variant: "wordmarkDark",
    });
    expect(
      parseIconUrl("https://res.cloudinary.com/demo/image/upload/x.png"),
    ).toBeNull();
    expect(
      parseIconUrl("https://thesvg.org/icons/../x/default.svg"),
    ).toBeNull();
    expect(parseIconUrl(null)).toBeNull();
  });

  it("normalises names the way people type them", () => {
    expect(normalize("Next.js")).toBe("nextjs");
    expect(normalize("Tailwind CSS")).toBe("tailwindcss");
    expect(normalize("C#")).toBe("csharp");
    expect(normalize("C++")).toBe("cplusplus");
  });

  it("puts the brand itself first", () => {
    expect(slugs("Next.js").slice(0, 2)).toEqual(["nextdotjs", "nextjs"]);
    expect(slugs("PostgreSQL")[0]).toBe("postgresql");
    expect(slugs("postgres")[0]).toBe("postgresql");
    expect(slugs("Aws")[0]).toBe("aws");
    expect(slugs("C#")).toEqual(["csharp"]);
    expect(slugs("Tailwind CSS")).toEqual(["tailwind-css"]);
    expect(slugs("React")[0]).toBe("react");
  });

  it("ranks cloud architecture icons after brand icons", () => {
    const pg = slugs("PostgreSQL");
    expect(pg.indexOf("azure-arc-postgresql")).toBeGreaterThan(
      pg.indexOf("postgresql-badge"),
    );
    const aws = slugs("aws");
    expect(aws.indexOf("aws-aws-iq")).toBeGreaterThan(aws.indexOf("nova-aws"));
  });

  it("matches aliases, ignores empty queries and respects the limit", () => {
    expect(slugs("postgres backup")[0]).toBe("databasus");
    expect(searchIcons(catalog, "   ")).toEqual([]);
    expect(searchIcons(catalog, "a", 3)).toHaveLength(3);
  });

  it("maps detected technology names to icons with a safe fallback", () => {
    expect(technologyIcon("GitHub Actions")).toBe(iconUrl("github-actions"));
    expect(technologyIcon("TypeScript")).toBe(iconUrl("typescript"));
    expect(technologyIcon("Unknown internal tool")).toBeNull();
  });
});
