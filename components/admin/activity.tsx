"use client";

import type { AuditEntry } from "@/lib/admin/api";
import { timeAgo } from "./ui";

const LABELS: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.logout": "Signed out",
  "auth.denied": "Blocked sign-in attempt",
  "auth.code_sent": "Sign-in code sent",
  "auth.code_resent": "Sign-in code resent",
  "auth.code_failed": "Wrong sign-in code",
  "section.update": "Edited section",
  "project.create": "Created project",
  "project.update": "Updated project",
  "project.delete": "Deleted project",
  "project.reorder": "Reordered projects",
  "post.create": "Created article",
  "post.update": "Updated article",
  "post.delete": "Deleted article",
  "skill.create": "Added skill",
  "skill.update": "Updated skill",
  "skill.delete": "Deleted skill",
  "skill.reorder": "Reordered skills",
  "media.upload": "Uploaded file",
  "media.delete": "Deleted file",
};

const WARN = new Set(["auth.denied", "auth.code_failed"]);

export function ActivityList({ entries }: { entries: AuditEntry[] }) {
  if (entries.length === 0) return <p className="text-[13px] text-black-a60">No activity yet.</p>;
  return (
    <ul className="flex flex-col">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-baseline justify-between gap-4 border-b border-black-a10 py-2.5 last:border-0">
          <span className="min-w-0 truncate text-[13px]">
            <span className={WARN.has(entry.action) ? "font-medium text-red-600" : "text-black-token"}>
              {LABELS[entry.action] ?? entry.action}
            </span>
            {entry.target && <span className="text-black-a60"> · {entry.target}</span>}
            {WARN.has(entry.action) && entry.actor && <span className="text-black-a60"> · {entry.actor}</span>}
          </span>
          <time dateTime={entry.at} title={new Date(entry.at).toLocaleString()} className="flex-none text-[12px] text-black-a60">
            {timeAgo(entry.at)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export const ACTIVITY_LABELS = LABELS;
