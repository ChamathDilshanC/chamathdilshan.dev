import { Media } from "@/components/ui/media";
import type { Project } from "@/lib/types/content";

type Props = {
  project: Pick<Project, "title" | "category" | "thumbnail">;
  sizes: string;
};

/** Case-study cover with title and category. Zooms gently on hover; on touch screens it settles as it scrolls in. */
export function WorkCard({ project, sizes }: Props) {
  return (
    <div className="group flex w-full flex-col gap-3">
      <div className="touch-frame relative aspect-[4/5] w-full overflow-hidden rounded-[5px] bg-neutral-900 m:aspect-[16/10]">
        <Media
          src={project.thumbnail.url}
          alt={project.thumbnail.alt}
          sizes={sizes}
          fit="contain"
          className="touch-settle transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
      </div>
      <div className="flex w-full items-start justify-between gap-4 type-body-3 text-black-token">
        <p>{project.title}</p>
        <p className="text-right text-black-a60">{project.category}</p>
      </div>
    </div>
  );
}
