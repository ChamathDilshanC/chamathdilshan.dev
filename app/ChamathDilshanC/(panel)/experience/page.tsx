"use client";

import { IconArrowRight, IconExternalLink, IconPencil, IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import useSWR from "swr";
import { toInput } from "@/components/admin/entity-editor";
import { ADMIN } from "@/components/admin/shell";
import { ButtonLink, EmptyState, ErrorBanner, PageHeader, Spinner, Switch, timeAgo } from "@/components/admin/ui";
import { adminFetch, errorMessage, type ExperienceOut } from "@/lib/admin/api";
import { tenure, yearRange } from "@/lib/experience";
import { thumbnail } from "@/lib/media";
import { toast } from "@/lib/toast";

/** Oldest role first, so the list reads like the promotion path it is. */
function Path({ titles }: { titles: string[] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] text-black-a60">
      {titles.map((title, i) => (
        <Fragment key={`${i}-${title}`}>
          {i > 0 && <IconArrowRight aria-hidden className="size-3 flex-none" />}
          <span className={i === titles.length - 1 ? "text-black-token" : undefined}>{title}</span>
        </Fragment>
      ))}
    </span>
  );
}

export default function ExperiencePage() {
  const { data, error, isLoading, mutate } = useSWR<ExperienceOut[]>("/api/admin/experience");
  const [busy, setBusy] = useState<number | null>(null);

  const setVisible = async (item: ExperienceOut, published: boolean) => {
    setBusy(item.id);
    try {
      const saved = await adminFetch<ExperienceOut>(`/api/admin/experience/${item.id}`, {
        method: "PUT",
        body: { ...toInput(item), published },
      });
      await mutate((list) => list?.map((e) => (e.id === saved.id ? saved : e)), { revalidate: false });
    } catch (err) {
      toast.error("Not saved", { description: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const addButton = (
    <ButtonLink href={`${ADMIN}/experience/new`} variant="primary" icon={<IconPlus className="size-4" />}>
      Add company
    </ButtonLink>
  );

  return (
    <>
      <PageHeader
        title="Experience"
        description="Your work timeline on the about page. Promoted? Add a role to the same company. Moved on? End the role and add the new company. Order follows the dates."
        actions={addButton}
      />
      {error && <ErrorBanner>{errorMessage(error)}</ErrorBanner>}
      {isLoading && <Spinner />}
      {data && data.length === 0 && (
        <EmptyState
          title="No experience yet"
          description="Add a company and the roles you held there. The about page shows the timeline once one is visible."
          action={addButton}
        />
      )}
      {data && data.length > 0 && (
        <ol className="overflow-hidden rounded-[8px] bg-white-token ring-1 ring-black-a10">
          {data.map((item) => (
            <li key={item.id} className="flex flex-col gap-4 border-b border-black-a10 p-4 last:border-0 m:flex-row m:items-center">
              <Link href={`${ADMIN}/experience/${item.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <span className="relative flex size-11 flex-none items-center justify-center overflow-hidden rounded-[6px] bg-neutral-50 ring-1 ring-black-a10 ring-inset">
                  {item.logo ? (
                    <Image src={thumbnail(item.logo, 88)} alt="" fill unoptimized sizes="44px" className="object-contain p-1.5" />
                  ) : (
                    <span className="font-geist text-[14px] font-semibold">{item.company.charAt(0)}</span>
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-[14.5px] font-medium tracking-[-0.2px]">{item.company}</span>
                  <Path titles={[...item.roles].reverse().map((role) => role.title)} />
                  <span className="truncate text-[12px] text-black-a60">
                    {yearRange(tenure(item))} · {item.roles.length} {item.roles.length === 1 ? "role" : "roles"} · edited{" "}
                    {timeAgo(item.updatedAt)}
                  </span>
                </span>
              </Link>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Switch
                  checked={item.published}
                  onChange={(published) => void setVisible(item, published)}
                  label={busy === item.id ? "Saving…" : item.published ? "Visible" : "Hidden"}
                />
                <div className="flex items-center">
                  {item.published && (
                    <a
                      href="/about#experience"
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
                    href={`${ADMIN}/experience/${item.id}`}
                    aria-label={`Edit ${item.company}`}
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
