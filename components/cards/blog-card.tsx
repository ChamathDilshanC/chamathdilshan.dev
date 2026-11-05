import { Media } from "@/components/ui/media";
import type { Post } from "@/lib/types/content";
import { cn } from "@/lib/cn";

type Props = {
  post: Pick<Post, "title" | "category" | "cover">;
  sizes: string;
  /** Aspect-ratio class for the cover. */
  aspect?: string;
};

/** Article cover with title and category. */
export function BlogCard({ post, sizes, aspect = "aspect-[4/5]" }: Props) {
  return (
    <div className="group flex w-full cursor-pointer flex-col items-center justify-start gap-2.5">
      <div className={cn("relative flex w-full items-center justify-center overflow-hidden rounded-[5px] bg-black-token", aspect)}>
        <span className="absolute inset-0 rounded-[5px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
          <Media src={post.cover.url} alt={post.cover.alt} sizes={sizes} />
        </span>
      </div>
      <div className="flex w-full items-start justify-between gap-4 type-body-3">
        <p className="line-clamp-2 min-h-[2lh] text-black-token">{post.title}</p>
        <p className="text-right whitespace-nowrap text-black-a60">{post.category}</p>
      </div>
    </div>
  );
}
