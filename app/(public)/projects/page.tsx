import type { Metadata } from "next";
import { Suspense } from "react";
import { ListHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { WorkGrid } from "@/components/sections/card-grids";
import { PaginatedCardGrid } from "@/components/sections/paginated-card-grid";
import { SectionTitle } from "@/components/ui/section-title";
import { getProjects, getSiteContent } from "@/lib/content";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Projects",
  description: "Case studies: web apps, APIs and platforms.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [content, projects] = await Promise.all([getSiteContent(), getProjects()]);
  const page = content["page.projects"];
  return (
    <>
      <ListHero
        active="projects"
        title={page.title}
        count={projects.length}
        description={page.description}
        image={page.image}
        imageAlt={page.imageAlt}
      />
      <section
        id="work"
        className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-15 pb-20 m:gap-20 m:pb-30 l:gap-17.5"
      >
        <Curtain className="bg-white-token" />
        <div className="relative w-full max-w-360">
          <SectionTitle title={page.listTitle} aside={page.listAside} />
        </div>
        <div className="relative w-full max-w-360">
          <Suspense fallback={<WorkGrid projects={projects.slice(0, LIST_PAGE_SIZE)} />}>
            <PaginatedCardGrid kind="projects" items={projects} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
