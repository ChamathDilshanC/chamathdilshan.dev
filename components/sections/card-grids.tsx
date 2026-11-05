import Link from "next/link";
import { BlogCard } from "@/components/cards/blog-card";
import { WorkCard } from "@/components/cards/work-card";
import { Reveal } from "@/components/motion/reveal";
import type { Post, Project } from "@/lib/types/content";
import { cn } from "@/lib/cn";

/** Two-column grid of case studies. */
export function WorkGrid({ projects, className }: { projects: readonly Project[]; className?: string }) {
  return (
    <div className={cn("grid w-full grid-cols-1 gap-x-2.5 gap-y-10 m:grid-cols-2", className)}>
      {projects.map((project, i) => (
        <Link key={project.slug} href={`/projects/${project.slug}`} className="touch-press block">
          <Reveal duration={0.8} delay={0.1 * (i % 2)}>
            <WorkCard project={project} sizes="(min-width: 810px) 50vw, 100vw" />
          </Reveal>
        </Link>
      ))}
    </div>
  );
}

/** Grid of articles; `columns` 2 for the journal index, 3 for "More Articles". */
export function PostGrid({ posts, columns = 2, className }: { posts: readonly Post[]; columns?: 2 | 3; className?: string }) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-x-2.5 gap-y-10",
        columns === 2 ? "m:grid-cols-2 m:gap-y-15" : "m:grid-cols-2 l:grid-cols-3",
        className,
      )}
    >
      {posts.map((post, i) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className="touch-press block">
          <Reveal duration={0.8} delay={0.1 * (i % columns)}>
            <BlogCard
              post={post}
              aspect={columns === 2 ? "aspect-[4/3]" : "aspect-[4/5]"}
              sizes={columns === 2 ? "(min-width: 810px) 50vw, 100vw" : "(min-width: 1200px) 33vw, (min-width: 810px) 50vw, 100vw"}
            />
          </Reveal>
        </Link>
      ))}
    </div>
  );
}
