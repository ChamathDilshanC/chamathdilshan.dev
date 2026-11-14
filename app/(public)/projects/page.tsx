import type { Metadata } from "next";
import { Suspense } from "react";
import { ListHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { WorkGrid } from "@/components/sections/card-grids";
import { PaginatedCardGrid } from "@/components/sections/paginated-card-grid";
import { SectionTitle } from "@/components/ui/section-title";
import { PlaceholderProvider } from "@/components/ui/placeholders";
import { getProjects, getSiteContent } from "@/lib/content";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import { placeholders } from "@/lib/placeholders";
import { JsonLd, pageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: "Case studies: web apps, APIs and platforms.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const [content, projects] = await Promise.all([
    getSiteContent(),
    getProjects(),
  ]);
  const projectPreviews = await placeholders([projects[0]?.thumbnail.url]);
  const page = content["page.projects"];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Projects",
          description: "Case studies: web apps, APIs and platforms.",
          url: `${siteUrl}/projects`,
          isPartOf: { "@type": "WebSite", url: siteUrl },
        }}
      />
      <ListHero
        active="projects"
        title={page.title}
        count={projects.length}
        description={page.description}
        image={page.image}
        imageAlt={page.imageAlt}
      />
      <PlaceholderProvider value={projectPreviews}>
        <section
          id="work"
          className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-15 pb-20 m:gap-20 m:pb-30 l:gap-17.5"
        >
          <Curtain className="bg-white-token" />
          <div className="relative w-full max-w-360">
            <SectionTitle title={page.listTitle} aside={page.listAside} />
          </div>
          <div className="relative w-full max-w-360">
            <Suspense
              fallback={
                <WorkGrid projects={projects.slice(0, LIST_PAGE_SIZE)} />
              }
            >
              <PaginatedCardGrid kind="projects" items={projects} />
            </Suspense>
          </div>
        </section>
      </PlaceholderProvider>
    </>
  );
}
