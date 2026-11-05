/**
 * Default skills — the build-time fallback and the database seed.
 * Manage the real list in the admin panel under Skills.
 */

import type { Skill } from "@/lib/types/content";

const skill = (name: string, category: string, featured = true): Skill => ({
  name,
  category,
  icon: null,
  featured,
  visible: true,
});

export const defaultSkills: Skill[] = [
  skill("Next.js", "Frontend"),
  skill("React", "Frontend"),
  skill("TypeScript", "Frontend"),
  skill("Tailwind CSS", "Frontend", false),
  skill("Python", "Backend", false),
  skill("FastAPI", "Backend"),
  skill("PostgreSQL", "Backend"),
  skill("Supabase", "Backend"),
];
