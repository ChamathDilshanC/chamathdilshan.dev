"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Reshaped } from "reshaped/bundle";
import Pagination from "@/components/ui/reshaped-pagination";
import { paginateItems } from "@/lib/pagination";
import type { Post, Project } from "@/lib/types/content";
import { PostGrid, WorkGrid } from "./card-grids";
import styles from "./paginated-card-grid.module.css";

type Props = { kind: "projects"; items: readonly Project[] } | { kind: "journal"; items: readonly Post[] };

/** URL-backed pagination keeps the listing pages statically cached. */
export function PaginatedCardGrid(props: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pagination = paginateItems<Project | Post>(props.items, searchParams.get("page"));
  const { page, totalPages, first, last } = pagination;
  const results = useRef<HTMLDivElement>(null);
  const previousPage = useRef(page);
  const label = props.kind === "projects" ? "Projects" : "Journal";

  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [page]);

  function changePage(nextPage: number) {
    if (nextPage === page) return;
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage === 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    window.history.pushState(null, "", `${pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }

  return (
    <div className="flex w-full flex-col gap-10 m:gap-15">
      <div ref={results} tabIndex={-1} aria-label={`${label} results, page ${page} of ${totalPages}`} className="scroll-mt-24 outline-none">
        {props.kind === "projects" ? (
          <WorkGrid key={page} projects={pagination.items as Project[]} />
        ) : (
          <PostGrid key={page} posts={pagination.items as Post[]} />
        )}
      </div>
      {totalPages > 1 && (
        <nav aria-label={`${label} pagination`} className="flex w-full flex-col gap-4">
          <p aria-live="polite" aria-atomic="true" className="text-center type-body-4 text-black-a60">
            Showing {first}–{last} of {props.items.length} {props.kind === "projects" ? "projects" : "articles"}
          </p>
          <Reshaped theme="slate" colorMode="light" scoped className={styles.theme}>
            <div className="w-full overflow-x-auto py-1">
              <div className="flex w-max min-w-full justify-center">
                <Pagination
                  total={totalPages}
                  page={page}
                  previousAriaLabel={`Previous ${props.kind === "projects" ? "projects" : "articles"} page`}
                  nextAriaLabel={`Next ${props.kind === "projects" ? "projects" : "articles"} page`}
                  pageAriaLabel={({ page: number }) => `${label} page ${number}`}
                  onChange={({ page: number }) => changePage(number)}
                />
              </div>
            </div>
          </Reshaped>
        </nav>
      )}
    </div>
  );
}
