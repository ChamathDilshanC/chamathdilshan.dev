import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui-style class helper: joins conditional classes and lets later
 * Tailwind classes override earlier conflicting ones. Used by components in
 * components/ui that follow the shadcn convention (`@/lib/utils`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
