"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { FormEditor } from "@/components/admin/form-editor";
import { ADMIN } from "@/components/admin/shell";
import { ErrorBanner, PageHeader, Spinner, timeAgo } from "@/components/admin/ui";
import { adminFetch, errorMessage, type SectionDetail } from "@/lib/admin/api";
import { withDefaults } from "@/lib/admin/schema";

/** Where each section appears on the public site. */
function publicPath(key: string): string {
  if (key === "page.projects") return "/projects";
  if (key === "page.blog") return "/blog";
  if (key === "page.contact") return "/contact";
  if (key === "page.about" || key.startsWith("about.")) return "/about";
  return "/";
}

export default function SectionEditorPage() {
  const { key } = useParams<{ key: string }>();
  const path = `/api/admin/sections/${encodeURIComponent(key)}`;
  const { data, error, isLoading, mutate } = useSWR<SectionDetail>(path, { revalidateOnFocus: false });

  if (error)
    return (
      <>
        <PageHeader title="Section" back={{ href: `${ADMIN}/sections`, label: "Sections" }} />
        <ErrorBanner>{errorMessage(error)}</ErrorBanner>
      </>
    );
  if (isLoading || !data) return <Spinner />;

  return (
    <FormEditor
      key={data.key}
      title={data.title}
      description={
        <>
          {data.description}{" "}
          <span className="text-black/40">· {data.updatedAt ? `Last edited ${timeAgo(data.updatedAt)}` : "Showing default content"}</span>
        </>
      }
      back={{ href: `${ADMIN}/sections`, label: "Sections" }}
      schema={data.schema}
      initial={withDefaults(data.data, data.schema, data.schema) as Record<string, unknown>}
      uploadFolder={`sections/${key}`}
      viewHref={publicPath(data.key)}
      onSave={async (value) => {
        const saved = await adminFetch<SectionDetail>(path, { method: "PUT", body: value });
        await mutate(saved, { revalidate: false });
      }}
    />
  );
}
