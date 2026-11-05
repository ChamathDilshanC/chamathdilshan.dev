import type { Metadata } from "next";
import { ListHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { PostGrid } from "@/components/sections/card-grids";
import { SectionTitle } from "@/components/ui/section-title";
import { getPosts, getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes on code, product and craft.",
  alternates: { canonical: "/blog" },
};

export default async function JournalPage() {
  const [content, posts] = await Promise.all([getSiteContent(), getPosts()]);
  const page = content["page.blog"];
  return (
    <>
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
          <PostGrid posts={posts} />
        </div>
      </section>
    </>
  );
}
