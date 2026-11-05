"use client";

import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import useSWR from "swr";
import { ADMIN } from "@/components/admin/shell";
import { ErrorBanner, PageHeader, Spinner, timeAgo } from "@/components/admin/ui";
import { errorMessage, type SectionSummary } from "@/lib/admin/api";

const GROUPS = [
  { name: "Home", description: "The home page, top to bottom." },
  { name: "Pages", description: "Projects, Journal, About and Contact pages." },
  { name: "Global", description: "Shown on every page." },
];

export default function SectionsPage() {
  const { data, error, isLoading } = useSWR<SectionSummary[]>("/api/admin/sections");

  return (
    <>
      <PageHeader
        title="Sections"
        description="Every block of text and imagery on the public site. Projects, articles and skills have their own pages."
      />
      {error && <ErrorBanner>{errorMessage(error)}</ErrorBanner>}
      {isLoading && <Spinner />}
      {data &&
        GROUPS.map((group) => {
          const items = data.filter((s) => s.group === group.name);
          if (items.length === 0) return null;
          return (
            <section key={group.name} className="flex flex-col gap-3">
              <div>
                <h2 className="font-geist text-[15px] font-semibold tracking-[-0.3px]">{group.name}</h2>
                <p className="text-[12.5px] text-black-a60">{group.description}</p>
              </div>
              <ul className="overflow-hidden rounded-[8px] bg-white-token ring-1 ring-black-a10">
                {items.map((section) => (
                  <li key={section.key} className="border-b border-black-a10 last:border-0">
                    <Link
                      href={`${ADMIN}/sections/${section.key}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-[14px] font-medium tracking-[-0.2px]">{section.title}</span>
                        <span className="truncate text-[12.5px] text-black-a60">{section.description}</span>
                      </span>
                      <span className="hidden flex-none text-[12px] text-black-a60 m:block">
                        {section.updatedAt ? `Edited ${timeAgo(section.updatedAt)}` : "Default content"}
                      </span>
                      <IconChevronRight className="size-4 flex-none text-black-a60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
    </>
  );
}
