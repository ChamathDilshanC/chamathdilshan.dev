import Link from "next/link";
import { BlogCard } from "@/components/cards/blog-card";
import { Reveal } from "@/components/motion/reveal";
import { ArrowLink } from "@/components/ui/arrow-link";
import { SectionTitle } from "@/components/ui/section-title";
import type { HomeJournal, Post } from "@/lib/types/content";

/** Latest four articles. */
export function Journal({ journal, posts }: { journal: HomeJournal; posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-6 pb-20 m:gap-20 m:pb-30 l:gap-17.5">
      <div className="w-full max-w-360">
        <SectionTitle title={journal.title} aside={journal.aside} />
      </div>
      <div className="grid w-full max-w-360 grid-cols-1 gap-x-2.5 gap-y-10 m:grid-cols-2 l:grid-cols-4">
        {posts.slice(0, 4).map((post, i) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
            <Reveal duration={0.8} delay={0.1 * i}>
              <BlogCard post={post} sizes="(min-width: 1200px) 25vw, (min-width: 810px) 50vw, 100vw" />
            </Reveal>
          </Link>
        ))}
      </div>
      <div className="flex w-full max-w-360 justify-center">
        <ArrowLink href={journal.cta.href} variant="dark">
          {journal.cta.label}
        </ArrowLink>
      </div>
    </section>
  );
}
