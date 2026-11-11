import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MarqueeBrands from "@/components/shadcn-space/marquee/marquee-02";
import { siblingValue } from "@/lib/admin/schema";
import { toolboxLogo } from "@/lib/toolbox";

describe("Toolbox logo marquee", () => {
  it("replaces photos in old API caches and preserves custom or cleared logos", () => {
    expect(toolboxLogo({ name: "Docker", role: "Containers", image: "/images/placeholders/team-3.jpg" })).toBe("https://thesvg.org/icons/docker/default.svg");
    expect(toolboxLogo({ name: "Custom", role: "", image: "https://cdn.example.com/logo.svg" })).toBe("https://cdn.example.com/logo.svg");
    expect(toolboxLogo({ name: "Custom", role: "", image: "/images/placeholders/old.jpg" })).toBeNull();
    expect(toolboxLogo({ name: "Docker", role: "", image: null })).toBeNull();
  });

  it("renders the editorial tool grid with logos and roles", () => {
    const html = renderToStaticMarkup(<MarqueeBrands items={[{ name: "Docker", role: "Containers", image: "/images/placeholders/team-3.jpg" }]} />);
    expect(html).toContain("https://thesvg.org/icons/docker/default.svg");
    expect(html).not.toContain("/images/placeholders/");
    expect(html).toContain("Containers");
    expect(html).toContain(">01<");
    expect(html).not.toContain("Pause toolbox scrolling");
  });

  it("renders nothing when the admin removes every tool", () => {
    expect(renderToStaticMarkup(<MarqueeBrands items={[]} />)).toBe("");
  });
});

describe("brand picker name suggestions", () => {
  it("reads the name from the current Toolbox item instead of a different item", () => {
    const values = { items: [{ name: "Docker" }, { name: "Figma" }] };
    expect(siblingValue(values, "items.0.image", "name")).toBe("Docker");
    expect(siblingValue(values, "items.1.image", "name")).toBe("Figma");
    expect(siblingValue(values, "items.2.image", "name")).toBeUndefined();
  });

  it("still suggests top-level skill names", () => {
    expect(siblingValue({ name: "React" }, "icon", "name")).toBe("React");
  });
});
