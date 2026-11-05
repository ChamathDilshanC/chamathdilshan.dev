"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { adminFetch, errorMessage, type JsonSchemaRoot } from "@/lib/admin/api";
import { defaultFor, withDefaults } from "@/lib/admin/schema";
import { toast } from "@/lib/toast";
import { FormEditor } from "./form-editor";
import type { FieldGroup } from "./schema-form";
import { ADMIN } from "./shell";
import { Badge, ErrorBanner, PageHeader, Spinner } from "./ui";

type Kind = "project" | "post";

const CONFIG: Record<Kind, { api: string; list: string; listLabel: string; noun: string; site: string; groups: FieldGroup[] }> = {
  project: {
    api: "/api/admin/projects",
    list: `${ADMIN}/projects`,
    listLabel: "Projects",
    noun: "project",
    site: "/projects",
    groups: [
      { title: "Basics", fields: ["title", "slug", "category", "year", "summary"] },
      {
        title: "Media",
        description: "The thumbnail shows on cards. The hero and gallery can be images or videos.",
        fields: ["thumbnail", "hero", "gallery"],
      },
      { title: "Story", fields: ["intro", "discover", "explore", "results"] },
      { title: "Details", fields: ["tech", "liveUrl", "repoUrl"] },
      { title: "Visibility", fields: ["published", "featured"] },
    ],
  },
  post: {
    api: "/api/admin/posts",
    list: `${ADMIN}/blog`,
    listLabel: "Journal",
    noun: "article",
    site: "/blog",
    groups: [
      { title: "Basics", fields: ["title", "slug", "category", "date", "excerpt", "cover"] },
      { title: "Body", description: "Each part has a heading, paragraphs and up to two images.", fields: ["sections"] },
      { title: "Visibility", fields: ["published"] },
    ],
  },
};

const META = new Set(["id", "sortOrder", "createdAt", "updatedAt"]);

/** The editable part of an API record (the write models reject read-only fields). */
export function toInput(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !META.has(key)));
}

export function EntityEditor({ kind, id }: { kind: Kind; id: number | null }) {
  const cfg = CONFIG[kind];
  const router = useRouter();
  const schema = useSWR<JsonSchemaRoot>(`/api/admin/schemas/${kind}`, { revalidateOnFocus: false });
  const record = useSWR<Record<string, unknown>>(id ? `${cfg.api}/${id}` : null, { revalidateOnFocus: false });

  const back = { href: cfg.list, label: cfg.listLabel };
  const failure = schema.error ?? record.error;
  if (failure)
    return (
      <>
        <PageHeader title={`Edit ${cfg.noun}`} back={back} />
        <ErrorBanner>{errorMessage(failure)}</ErrorBanner>
      </>
    );
  if (!schema.data || (id && !record.data)) return <Spinner />;

  const root = schema.data;
  const initial = (
    record.data
      ? withDefaults(toInput(record.data), root, root)
      : { ...(defaultFor(root, root) as Record<string, unknown>), ...(kind === "post" ? { date: new Date().toISOString().slice(0, 10) } : {}) }
  ) as Record<string, unknown>;

  const slug = typeof record.data?.slug === "string" ? record.data.slug : null;
  const published = record.data?.published === true;

  return (
    <FormEditor
      key={id ?? "new"}
      back={back}
      title={
        <span className="flex flex-wrap items-center gap-3">
          {(record.data?.title as string | undefined) || `New ${cfg.noun}`}
          {record.data && <Badge tone={published ? "success" : "neutral"}>{published ? "Published" : "Draft"}</Badge>}
        </span>
      }
      description={slug ? `${cfg.site}/${slug}` : `Fill in the basics and save. It stays a draft until you publish it.`}
      schema={root}
      initial={initial}
      groups={cfg.groups}
      saveLabel={id ? "Save changes" : `Create ${cfg.noun}`}
      viewHref={slug && published ? `${cfg.site}/${slug}` : null}
      deleteLabel={`Delete ${cfg.noun}`}
      onSave={async (value) => {
        if (id) {
          const saved = await adminFetch<Record<string, unknown>>(`${cfg.api}/${id}`, { method: "PUT", body: value });
          await record.mutate(saved, { revalidate: false });
        } else {
          const created = await adminFetch<{ id: number }>(cfg.api, { method: "POST", body: value });
          router.replace(`${cfg.list}/${created.id}`);
        }
      }}
      onDelete={
        id
          ? async () => {
              await adminFetch(`${cfg.api}/${id}`, { method: "DELETE" });
              toast.success(`Deleted the ${cfg.noun}`);
              router.replace(cfg.list);
            }
          : undefined
      }
    />
  );
}
