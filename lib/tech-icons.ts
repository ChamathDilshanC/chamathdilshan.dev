import { iconUrl, normalize } from "@/lib/thesvg";

const SLUGS: Record<string, string> = {
  actions: "github-actions",
  "aws sdk": "aws",
  awssdk: "aws",
  aws: "aws",
  alembic: "python",
  ".net": "dotnet",
  ".net 8": "dotnet",
  avalonia: "windows",
  csharp: "csharp",
  docker: "docker",
  fastapi: "fastapi",
  ffmpeg: "ffmpeg",
  github: "github",
  "github actions": "github-actions",
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
  sqlalchemy: "sqlalchemy",
  supabase: "supabase",
  "tailwind css": "tailwind-css",
  tailwindcss: "tailwind-css",
  tauri: "tauri",
  typescript: "typescript",
  ts: "typescript",
  nodejs: "nodejs",
  vite: "vite",
  vercel: "vercel",
  terraform: "terraform",
  prisma: "prisma",
  java: "java",
  "java/maven": "apache-maven",
  javamaven: "apache-maven",
  "java/gradle": "gradle",
  javagradle: "gradle",
  "vue.js": "vue",
  vue: "vue",
};

/** Returns the existing theSVG brand icon for a detected technology, if known. */
export function technologyIcon(name: string): string | null {
  const key = name.toLowerCase().trim();
  const slug = SLUGS[key] ?? SLUGS[normalize(name)];
  return slug ? iconUrl(slug) : null;
}
