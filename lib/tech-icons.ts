import { iconUrl, normalize } from "@/lib/thesvg";

const SLUGS: Record<string, string> = {
  actions: "github-actions",
  ".net": "dotnet",
  ".net 8": "dotnet",
  avalonia: "windows",
  csharp: "csharp",
  docker: "docker",
  fastapi: "fastapi",
  ffmpeg: "ffmpeg",
  github: "github",
  githubactions: "github-actions",
  javascripttypescript: "typescript",
  javascript: "javascript",
  js: "javascript",
  "node.js": "nodejs",
  node: "nodejs",
  nextjs: "nextjs",
  postgresql: "postgresql",
  python: "python",
  react: "react",
  rust: "rust",
  supabase: "supabase",
  tauri: "tauri",
  typescript: "typescript",
  ts: "typescript",
  nodejs: "nodejs",
  vite: "vite",
  "vue.js": "vue",
  vue: "vue",
};

/** Returns the existing theSVG brand icon for a detected technology, if known. */
export function technologyIcon(name: string): string | null {
  const key = name.toLowerCase().trim();
  const slug = SLUGS[key] ?? SLUGS[normalize(name)];
  return slug ? iconUrl(slug) : null;
}
