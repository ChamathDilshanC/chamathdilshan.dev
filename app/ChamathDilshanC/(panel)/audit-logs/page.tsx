"use client";

import useSWR from "swr";
import { ACTIVITY_LABELS } from "@/components/admin/activity";
import { ErrorBanner, PageHeader, Spinner } from "@/components/admin/ui";
import { errorMessage, type AuditEntry } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

export default function AuditLogsPage() {
  const { data, error, isLoading } = useSWR<AuditEntry[]>("/api/admin/audit-logs?limit=200");

  return (
    <>
      <PageHeader title="Activity" description="Sign-ins, blocked attempts and every change made in the admin panel." />
      {error && <ErrorBanner>{errorMessage(error)}</ErrorBanner>}
      {isLoading && <Spinner />}
      {data && (
        <div className="overflow-x-auto rounded-[8px] bg-white-token ring-1 ring-black-a10">
          <table className="w-full min-w-160 text-left text-[13px]">
            <thead>
              <tr className="border-b border-black-a10 text-[12px] text-black-a60">
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">Event</th>
                <th className="px-4 py-2.5 font-medium">Target</th>
                <th className="px-4 py-2.5 font-medium">Account</th>
                <th className="px-4 py-2.5 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => {
                const alert = entry.action === "auth.denied" || entry.action === "auth.code_failed";
                return (
                  <tr key={entry.id} className="border-b border-black-a10 last:border-0">
                    <td className="px-4 py-2.5 whitespace-nowrap text-black-a60">{new Date(entry.at).toLocaleString()}</td>
                    <td className={cn("px-4 py-2.5", alert && "font-medium text-red-600")}>{ACTIVITY_LABELS[entry.action] ?? entry.action}</td>
                    <td className="max-w-60 truncate px-4 py-2.5">{entry.target || "—"}</td>
                    <td className="px-4 py-2.5 text-black-a60">{entry.actor || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-black-a60">{entry.ip || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && <p className="px-4 py-6 text-[13px] text-black-a60">No activity yet.</p>}
        </div>
      )}
    </>
  );
}
