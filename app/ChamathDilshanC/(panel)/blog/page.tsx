"use client";

import { IconExternalLink, IconPencil, IconPlus, IconUpload } from "@tabler/icons-react";
import Link from "next/link";
import useSWR from "swr";
import { MediaThumb } from "@/components/admin/media";
import { ADMIN } from "@/components/admin/shell";
import { Badge, ButtonLink, EmptyState, ErrorBanner, PageHeader, Spinner } from "@/components/admin/ui";
import { errorMessage, type PostOut } from "@/lib/admin/api";
import { formatPostDate } from "@/content/posts";

export default function JournalAdminPage() {
  const { data, error, isLoading } = useSWR<PostOut[]>("/api/admin/posts");

  const newButton = (
    <ButtonLink href={`${ADMIN}/blog/new`} variant="primary" icon={<IconPlus className="size-4" />}>
      New article
    </ButtonLink>
  );

  return (
    <>
      <PageHeader
        title="Journal"
        description="Articles on /blog, newest first. The latest four also appear on the home and about pages."
        actions={
          <>
            <ButtonLink href={`${ADMIN}/blog/import`} icon={<IconUpload className="size-4" />}>
              Import article
            </ButtonLink>
            {newButton}
          </>
        }
      />
      {error && <ErrorBanner>{errorMessage(error)}</ErrorBanner>}
      {isLoading && <Spinner />}
      {data && data.length === 0 && <EmptyState title="No articles yet" description="Write the first one." action={newButton} />}
      {data && data.length > 0 && (
        <ul className="overflow-hidden rounded-[8px] bg-white-token ring-1 ring-black-a10">
          {data.map((post) => (
            <li key={post.id} className="flex items-center gap-4 border-b border-black-a10 p-4 last:border-0">
              <Link href={`${ADMIN}/blog/${post.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <MediaThumb url={post.cover?.url ?? ""} kind="image" className="aspect-[4/3] w-20 flex-none rounded-[6px]" />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-[14.5px] font-medium tracking-[-0.2px]">{post.title}</span>
                  <span className="truncate text-[12.5px] text-black-a60">
                    {formatPostDate(post.date)}
                    {post.category && ` · ${post.category}`}
                  </span>
                </span>
              </Link>
              <Badge tone={post.published ? "success" : "neutral"}>{post.published ? "Published" : "Draft"}</Badge>
              <div className="flex">
                {post.published && (
                  <a
                    href={`/blog/${post.slug}`}
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
                  href={`${ADMIN}/blog/${post.id}`}
                  aria-label="Edit"
                  title="Edit"
                  className="inline-flex size-8 items-center justify-center rounded-[6px] text-black-a60 hover:bg-black-a10/60 hover:text-black-token"
                >
                  <IconPencil className="size-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
