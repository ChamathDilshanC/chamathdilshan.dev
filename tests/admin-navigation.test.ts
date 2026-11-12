import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ADMIN, ADMIN_NAV } from "@/components/admin/shell";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("GitHub AI Project Studio navigation", () => {
  it("exposes a labeled, authorized Admin sidebar route", () => {
    expect(ADMIN_NAV).toContainEqual(
      expect.objectContaining({
        href: `${ADMIN}/projects/studio`,
        label: "GitHub AI Studio",
      }),
    );
    expect(read("app/ChamathDilshanC/(panel)/projects/studio/page.tsx")).toContain(
      "GitHubProjectStudio",
    );
    expect(read("app/ChamathDilshanC/(panel)/layout.tsx")).toContain("AdminShell");
  });

  it("keeps the list and new-project entry points on real routes", () => {
    const projects = read("app/ChamathDilshanC/(panel)/projects/page.tsx");
    const editor = read("components/admin/entity-editor.tsx");
    expect(projects).toContain('Import from GitHub');
    expect(projects).toContain('href={`${ADMIN}/projects/studio`}');
    expect(projects).toContain('href={`${ADMIN}/projects/new`}');
    expect(editor).toContain("Import from GitHub instead");
    expect(editor).toContain("Open GitHub AI Project Studio");
    expect(existsSync(join(root, "app/ChamathDilshanC/(panel)/projects/new/page.tsx"))).toBe(true);
  });

  it("keeps the Studio workflow controls wired to the admin API", () => {
    const studio = read("components/admin/github-project-studio.tsx");
    for (const expected of [
      "/api/admin/github/repositories",
      "/api/admin/github/analyze",
      "/api/admin/studio/drafts/",
      "/api/admin/studio/projects",
      "Generate editable draft",
      "Presentation template",
      "Save draft to Projects",
      "Publish after review",
    ]) {
      expect(studio).toContain(expected);
    }
  });
});
