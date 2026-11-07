import { cn } from "@/lib/cn";
import { Media } from "@/components/ui/media";
import type { Post } from "@/lib/types/content";

type Props = {
  post: Pick<Post, "title" | "excerpt" | "cover">;
  sizes: string;
  /** Aspect-ratio class for the cover. */
  aspect?: string;
};

/** Article cover with title and category. */
export function BlogCard({ post, sizes, aspect = "aspect-[4/5]" }: Props) {
  return (
    <div className="group flex w-full cursor-pointer flex-col items-center justify-start gap-2.5">
      <div className={cn("touch-frame relative flex w-full items-center justify-center overflow-hidden rounded-[5px] bg-black-token", aspect)}>
        <span className="touch-settle absolute inset-0 rounded-[5px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
          <Media src={post.cover.url} alt={post.cover.alt} sizes={sizes} />
        </span>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 bg-linear-to-t from-black/85 via-black/45 to-transparent px-4 pt-16 pb-4 text-left m:px-5 m:pb-5">
          <span className="type-body-1 text-white-token">{post.title}</span>
          <span className="line-clamp-2 max-w-[42ch] type-body-4 text-white-a85">{post.excerpt}</span>
        </span>
      </div>
    </div>
  );
}
