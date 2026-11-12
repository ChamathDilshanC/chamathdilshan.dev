"use client";

import { IconArrowDown, IconArrowUp, IconExternalLink, IconPencil, IconPlus, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { toInput } from "@/components/admin/entity-editor";
import { MediaThumb } from "@/components/admin/media";
import { ADMIN } from "@/components/admin/shell";
import { Badge, ButtonLink, EmptyState, ErrorBanner, IconButton, PageHeader, Spinner, Switch, timeAgo } from "@/components/admin/ui";
import { adminFetch, errorMessage, type ProjectOut } from "@/lib/admin/api";
import { toast } from "@/lib/toast";

export default function ProjectsPage() {
  const { data, error, isLoading, mutate } = useSWR<ProjectOut[]>("/api/admin/projects");
  const [busy, setBusy] = useState<number | null>(null);

  const reorder = async (index: number, by: number) => {
    if (!data) return;
    const next = [...data];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(index + by, 0, item);
    try {
      await mutate(
        adminFetch<ProjectOut[]>("/api/admin/projects/reorder", { method: "POST", body: { ids: next.map((p) => p.id) } }),
        { optimisticData: next, rollbackOnError: true, revalidate: false },
      );
    } catch (err) {
      toast.error("Could not reorder", { description: errorMessage(err) });
    }
  };

  const update = async (project: ProjectOut, patch: Partial<ProjectOut>) => {
    setBusy(project.id);
    try {
      const saved = await adminFetch<ProjectOut>(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        body: { ...toInput(project), ...patch },
      });
      await mutate((list) => list?.map((p) => (p.id === saved.id ? saved : p)), { revalidate: false });
    } catch (err) {
      toast.error("Not saved", { description: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Case studies on /projects. Drafts stay private until Published is enabled. Featured ones also stack up in Selected Work on the home page, in this order."
        actions={
          <div className="flex flex-wrap gap-2"><ButtonLink href={`${ADMIN}/projects/studio`} variant="secondary" icon={<IconSparkles className="size-4" />}>Import from GitHub</ButtonLink><ButtonLink href={`${ADMIN}/projects/new`} variant="primary" icon={<IconPlus className="size-4" />}>New project</ButtonLink></div>
        }
      />
      {error && <ErrorBanner>{errorMessage(error)}</ErrorBanner>}
      {isLoading && <Spinner />}
      {data && data.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Add a thumbnail, a hero image or video and a gallery, then publish."
          action={
            <div className="flex flex-wrap gap-2"><ButtonLink href={`${ADMIN}/projects/studio`} variant="secondary" icon={<IconSparkles className="size-4" />}>Import from GitHub</ButtonLink><ButtonLink href={`${ADMIN}/projects/new`} variant="primary" icon={<IconPlus className="size-4" />}>New project</ButtonLink></div>
          }
        />
      )}
      {data && data.length > 0 && (
        <ol className="overflow-hidden rounded-[8px] bg-white-token ring-1 ring-black-a10">
          {data.map((project, i) => (
            <li key={project.id} className="flex flex-col gap-4 border-b border-black-a10 p-4 last:border-0 m:flex-row m:items-center">
              <Link href={`${ADMIN}/projects/${project.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <MediaThumb
                  url={project.thumbnail?.url ?? ""}
                  kind="image"
                  className="aspect-[16/10] w-28 flex-none rounded-[6px]"
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[14.5px] font-medium tracking-[-0.2px]">{project.title}</span>
                    {project.hero?.kind === "video" && <Badge>Video hero</Badge>}
                  </span>
                  <span className="truncate text-[12.5px] text-black-a60">
                    {[project.category, project.year].filter(Boolean).join(" · ") || "No category"} · edited {timeAgo(project.updatedAt)}
                  </span>
                </span>
              </Link>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Switch
                  checked={project.published}
                  onChange={(published) => void update(project, { published })}
                  label={busy === project.id ? "Saving…" : project.published ? "Published" : "Draft"}
                />
                <Switch checked={project.featured} onChange={(featured) => void update(project, { featured })} label="Featured" />
                <div className="flex items-center">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => reorder(i, -1)}>
                    <IconArrowUp className="size-4" />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === data.length - 1} onClick={() => reorder(i, 1)}>
                    <IconArrowDown className="size-4" />
                  </IconButton>
                  {project.published && (
                    <a
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="View on site"
                      title="View on site"
                      className="inline-flex size-8 items-center justify-center rounded-[6px] text-black-a60 hover:bg-black-a10/60 hover:text-black-token"
                    >
                      <IconExternalLink className="size-4" />
                    </a>
                  )}
                  <Link
                    href={`${ADMIN}/projects/${project.id}`}
                    aria-label="Edit"
                    title="Edit"
                    className="inline-flex size-8 items-center justify-center rounded-[6px] text-black-a60 hover:bg-black-a10/60 hover:text-black-token"
                  >
                    <IconPencil className="size-4" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
