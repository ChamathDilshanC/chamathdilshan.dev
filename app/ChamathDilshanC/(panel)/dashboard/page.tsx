"use client";

import { IconArrowUpRight, IconLayoutGrid, IconPhotoPlus, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import useSWR from "swr";
import { ActivityList } from "@/components/admin/activity";
import { ADMIN, useAdmin } from "@/components/admin/shell";
import { ButtonLink, Card, ErrorBanner, Notice, PageHeader, Spinner } from "@/components/admin/ui";
import { errorMessage, type Overview } from "@/lib/admin/api";

function Stat({ label, value, detail, href }: { label: string; value: number; detail?: string; href: string }) {
  return (
    <Link href={href} className="group flex flex-col gap-3 rounded-[8px] bg-white-token p-5 ring-1 ring-black-a10 transition-shadow hover:ring-black-a16">
      <span className="flex items-center justify-between text-[12.5px] text-black-a60">
        {label}
        <IconArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </span>
      <span className="font-geist text-[32px] leading-none font-semibold tracking-[-1.2px] tabular-nums">{value}</span>
      {detail && <span className="text-[12px] text-black-a60">{detail}</span>}
    </Link>
  );
}

export default function DashboardPage() {
  const me = useAdmin();
  const { data, error, isLoading } = useSWR<Overview>("/api/admin/overview");
  const first = me?.name?.split(" ")[0];

  return (
    <>
      <PageHeader
        title={first ? `Hello, ${first}` : "Dashboard"}
        description="Everything on chamathdilshan.com — sections, projects, articles, skills and media — is edited here. Changes go live on the next visit."
        actions={
          <>
            <ButtonLink href={`${ADMIN}/media`} icon={<IconPhotoPlus className="size-4" />}>
              Upload media
            </ButtonLink>
            <ButtonLink href={`${ADMIN}/projects/new`} variant="primary" icon={<IconPlus className="size-4" />}>
              New project
            </ButtonLink>
          </>
        }
      />

      {error && <ErrorBanner>{errorMessage(error)}</ErrorBanner>}
      {isLoading && <Spinner />}
      {data && (
        <>
          {!data.mediaConfigured && (
            <Notice>
              Cloudinary is not configured, so uploads are disabled. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and
              CLOUDINARY_API_SECRET on the API.
            </Notice>
          )}
          <div className="grid grid-cols-2 gap-3 l:grid-cols-4">
            <Stat label="Projects" value={data.projects} detail={`${data.projectsPublished} published`} href={`${ADMIN}/projects`} />
            <Stat label="Articles" value={data.posts} detail={`${data.postsPublished} published`} href={`${ADMIN}/blog`} />
            <Stat label="Skills" value={data.skills} href={`${ADMIN}/skills`} />
            <Stat label="Media files" value={data.media} detail="on Cloudinary" href={`${ADMIN}/media`} />
          </div>
          <div className="grid grid-cols-1 gap-5 l:grid-cols-[1fr_1.3fr]">
            <Card title="Edit the site" description="Every block of every page, section by section.">
              <div className="flex flex-col gap-2">
                {[
                  ["Hero & intro", "home.hero"],
                  ["Engagements (pricing)", "home.pricing"],
                  ["Services", "home.services"],
                  ["Testimonials", "home.testimonials"],
                  ["Home layout & order", "home.layout"],
                  ["Site settings", "site"],
                ].map(([label, key]) => (
                  <Link
                    key={key}
                    href={`${ADMIN}/sections/${key}`}
                    className="flex items-center justify-between rounded-[6px] px-3 py-2.5 text-[13.5px] ring-1 ring-black-a10 ring-inset transition-colors hover:bg-neutral-50"
                  >
                    {label}
                    <IconArrowUpRight className="size-4 text-black-a60" />
                  </Link>
                ))}
                <ButtonLink href={`${ADMIN}/sections`} variant="ghost" icon={<IconLayoutGrid className="size-4" />} className="mt-1 w-fit">
                  All sections
                </ButtonLink>
              </div>
            </Card>
            <Card title="Recent activity" actions={<ButtonLink href={`${ADMIN}/audit-logs`} variant="ghost">View all</ButtonLink>}>
              <ActivityList entries={data.recent} />
            </Card>
          </div>
        </>
      )}
    </>
  );
}
