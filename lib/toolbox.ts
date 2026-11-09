import type { ToolboxItem } from "@/lib/types/content";

// Old API caches can still contain the former photo tiles until revalidation.
const LEGACY_LOGOS: Record<string, string> = {
  "VS Code": "visual-studio-code",
  Figma: "figma",
  Docker: "docker",
  "GitHub Actions": "github-actions",
  Supabase: "supabase",
};

export function toolboxLogo(item: ToolboxItem): string | null {
  if (!item.image?.startsWith("/images/placeholders/")) return item.image || null;
  const slug = LEGACY_LOGOS[item.name];
  return slug ? `https://thesvg.org/icons/${slug}/default.svg` : null;
}
