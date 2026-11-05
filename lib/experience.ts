/**
 * Dates for the work timeline. Roles store months as "YYYY-MM"; a role
 * without an end month is current. Durations count both the first and the
 * last month, the way LinkedIn does (Jan – Jun is 6 mos).
 */

import type { Experience, ExperienceRole } from "@/lib/types/content";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Months since year 0, so two months subtract cleanly. */
function index(month: string): number {
  const [year = 0, mon = 1] = month.split("-").map(Number);
  return year * 12 + (mon - 1);
}

/** The current month as "YYYY-MM" (UTC). */
export function thisMonth(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** "2024-07" → "Jul 2024". */
export function monthLabel(month: string): string {
  const [year, mon] = month.split("-");
  return `${MONTHS[Number(mon) - 1] ?? ""} ${year ?? ""}`.trim();
}

/** Whole months from `start` to `end` (or `now`), counting both ends. Never below 1. */
export function monthsBetween(start: string, end: string | null, now: string = thisMonth()): number {
  return Math.max(1, index(end ?? now) - index(start) + 1);
}

/** 18 → "1 yr 6 mos", 12 → "1 yr", 1 → "1 mo". */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  if (rest) parts.push(`${rest} ${rest === 1 ? "mo" : "mos"}`);
  return parts.join(" ") || "1 mo";
}

/** "Jul 2024 – Present". */
export function roleRange(role: Pick<ExperienceRole, "start" | "end">): string {
  return `${monthLabel(role.start)} – ${role.end ? monthLabel(role.end) : "Present"}`;
}

/** First start and last end across a company's roles (null end = still there). */
export function tenure(company: Pick<Experience, "roles">): { start: string; end: string | null } {
  const starts = company.roles.map((r) => r.start).sort();
  const current = company.roles.some((r) => !r.end);
  const ends = company.roles.map((r) => r.end ?? "").sort();
  return { start: starts[0] ?? "", end: current ? null : (ends.at(-1) ?? null) };
}

/** "2023 – Present", "2021 – 2023", or "2022" when it starts and ends in one year. */
export function yearRange({ start, end }: { start: string; end: string | null }): string {
  const from = start.slice(0, 4);
  if (!end) return `${from} – Present`;
  const to = end.slice(0, 4);
  return from === to ? from : `${from} – ${to}`;
}
