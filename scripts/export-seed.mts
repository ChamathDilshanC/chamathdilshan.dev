/**
 * Writes the default content (content/*.ts) as the backend seed file.
 *
 *   npm run export:seed                        # → ../api.chamathdilshan.dev/app/seed/content.json
 *   node scripts/export-seed.mts <out.json>
 *
 * Runs on Node's built-in TypeScript support (Node 22.18+ / 23.6+).
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { defaultPosts } from "../content/posts.ts";
import { defaultProjects } from "../content/projects.ts";
import { defaultContent } from "../content/site.ts";
import { defaultSkills } from "../content/skills.ts";

const out = resolve(process.argv[2] ?? "../api.chamathdilshan.dev/app/seed/content.json");

const seed = {
  sections: defaultContent,
  projects: defaultProjects,
  posts: defaultPosts,
  skills: defaultSkills,
};

writeFileSync(out, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
console.log(`seed written to ${out}`);
