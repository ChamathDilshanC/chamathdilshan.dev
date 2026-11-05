/**
 * Default work experience — the build-time fallback. Real roles are added in
 * the admin panel under Experience; with none, the about page hides the
 * timeline instead of showing made-up history.
 */

import type { Experience } from "@/lib/types/content";

export const defaultExperience: Experience[] = [];
