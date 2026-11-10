import type { Metadata } from "next";
import { Suspense } from "react";
import { ListHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { PostGrid } from "@/components/sections/card-grids";
import { PaginatedCardGrid } from "@/components/sections/paginated-card-grid";
import { SectionTitle } from "@/components/ui/section-title";
import { getPosts, getSiteContent } from "@/lib/content";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import { JsonLd, pageMetadata, siteUrl } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Journal",
  description: "Notes on code, product and craft.",
  path: "/blog",
});

export default async function JournalPage() {
  const [content, posts] = await Promise.all([getSiteContent(), getPosts()]);
  const page = content["page.blog"];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Journal",
          description: "Notes on code, product and craft.",
          url: `${siteUrl}/blog`,
          publisher: { "@type": "Person", name: "Chamath Dilshan", url: siteUrl },
        }}
      />
      <ListHero
        active="journal"
        title={page.title}
        count={posts.length}
        description={page.description}
        image={page.image}
        imageAlt={page.imageAlt}
      />
      <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-15 pb-20 m:gap-20 m:pb-30 l:gap-17.5">
        <Curtain className="bg-white-token" />
        <div className="relative w-full max-w-360">
          <SectionTitle title={page.listTitle} aside={page.listAside} />
        </div>
        <div className="relative w-full max-w-360">
          <Suspense fallback={<PostGrid posts={posts.slice(0, LIST_PAGE_SIZE)} />}>
            <PaginatedCardGrid kind="journal" items={posts} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
