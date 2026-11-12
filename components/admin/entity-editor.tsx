"use client";

import { useRouter } from "next/navigation";
import { IconSparkles } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import useSWR from "swr";
import { adminFetch, errorMessage, type JsonSchemaRoot } from "@/lib/admin/api";
import { defaultFor, withDefaults } from "@/lib/admin/schema";
import { toast } from "@/lib/toast";
import { FormEditor } from "./form-editor";
import type { FieldGroup } from "./schema-form";
import { ADMIN } from "./shell";
import { Badge, ButtonLink, ErrorBanner, PageHeader, Spinner } from "./ui";

type Kind = "project" | "post" | "experience";

type Config = {
  api: string;
  list: string;
  listLabel: string;
  noun: string;
  /** Public URL: the prefix before the slug, or the page itself for records without a slug. */
  site: string;
  groups: FieldGroup[];
  /** The field that names a record (default "title"). */
  titleKey?: string;
  /** Badge labels for published / not published. */
  badge?: [string, string];
  /** Header text for records without a slug. */
  intro?: string;
  /** The API reorders what is saved, so reload the form from the saved record. */
  reloadOnSave?: boolean;
};

const CONFIG: Record<Kind, Config> = {
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
      { title: "Studio presentation", description: "AI-generated content stays editable here. Evidence is retained with the project.", fields: ["template", "templateConfig", "studioContent", "seo", "repositories"] },
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
      {
        title: "Body",
        description: "Each part has a heading, paragraphs, up to two images and up to two videos.",
        fields: ["sections"],
      },
      { title: "Visibility", fields: ["published"] },
    ],
  },
  experience: {
    api: "/api/admin/experience",
    list: `${ADMIN}/experience`,
    listLabel: "Experience",
    noun: "company",
    site: "/about",
    titleKey: "company",
    badge: ["Visible", "Hidden"],
    intro: "Shown on /about. Roles are listed newest first, joined into one path.",
    reloadOnSave: true,
    groups: [
      { title: "Company", fields: ["company", "location", "companyUrl", "logo"] },
      { title: "Roles", fields: ["roles"] },
      {
        title: "Documents",
        description: "Upload one or more view-only service letters, employment letters or certificates. The label becomes the public button text.",
        fields: ["documents"],
      },
      { title: "Visibility", fields: ["published"] },
    ],
  },
};

const META = new Set(["id", "sortOrder", "createdAt", "updatedAt"]);

/** The editable part of an API record (the write models reject read-only fields). */
export function toInput(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !META.has(key)));
}

export function EntityEditor({ kind, id, imported, aside }: { kind: Kind; id: number | null; imported?: Record<string, unknown>; aside?: ReactNode }) {
  const cfg = CONFIG[kind];
  const router = useRouter();
  const schema = useSWR<JsonSchemaRoot>(`/api/admin/schemas/${kind}`, { revalidateOnFocus: false });
  const record = useSWR<Record<string, unknown>>(id ? `${cfg.api}/${id}` : null, { revalidateOnFocus: false });
  // Bumped after a save when the API reorders what it stores, to remount the form from the saved record.
  const [saves, setSaves] = useState(0);

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
      : withDefaults(
          imported ?? {
            ...(defaultFor(root, root) as Record<string, unknown>),
            ...(kind === "post" ? { date: new Date().toISOString().slice(0, 10) } : {}),
          },
          root,
          root,
        )
  ) as Record<string, unknown>;

  const slug = typeof record.data?.slug === "string" ? record.data.slug : null;
  const published = record.data?.published === true;
  const name = record.data?.[cfg.titleKey ?? "title"];
  const [shown, hidden] = cfg.badge ?? ["Published", "Draft"];
  const page = slug ? `${cfg.site}/${slug}` : cfg.intro && record.data ? cfg.site : null;

  return (
    <FormEditor
      key={`${id ?? "new"}-${saves}`}
      back={back}
      title={
        <span className="flex flex-wrap items-center gap-3">
          {(typeof name === "string" && name) || `New ${cfg.noun}`}
          {record.data && <Badge tone={published ? "success" : "neutral"}>{published ? shown : hidden}</Badge>}
        </span>
      }
      description={cfg.intro ?? (slug ? `${cfg.site}/${slug}` : `Fill in the basics and save. It stays a draft until you publish it.`)}
      schema={root}
      initial={initial}
      aside={
        kind === "project" ? (
          <div className="flex flex-wrap items-center gap-3 rounded-[8px] bg-neutral-100 p-3 text-[13px]">
            <ButtonLink href={`${ADMIN}/projects/studio`} variant="secondary" icon={<IconSparkles className="size-4" />}>
              {id ? "Open GitHub AI Project Studio" : "Import from GitHub instead"}
            </ButtonLink>
            {aside}
          </div>
        ) : aside
      }
      groups={cfg.groups}
      uploadFolder={`${kind === "post" ? "journal" : kind === "project" ? "projects" : "experience"}/${id ?? "draft"}`}
      saveLabel={id ? "Save changes" : `Create ${cfg.noun}`}
      viewHref={page && published ? page : null}
      deleteLabel={`Delete ${cfg.noun}`}
      onSave={async (value) => {
        if (id) {
          const saved = await adminFetch<Record<string, unknown>>(`${cfg.api}/${id}`, { method: "PUT", body: value });
          await record.mutate(saved, { revalidate: false });
          if (cfg.reloadOnSave) setSaves((n) => n + 1);
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
