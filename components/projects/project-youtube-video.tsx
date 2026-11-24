import { youtubeEmbedUrl } from "@/lib/youtube";
import type { Project } from "@/lib/types/content";

export function ProjectYoutubeVideo({ project }: { project: Project }) {
  const embedUrl = youtubeEmbedUrl(project.youtubeUrl);
  if (!embedUrl) return null;

  return (
    <section className="relative flex w-full flex-col items-center justify-center gap-7.5">
      <div className="flex w-full max-w-320 flex-col items-center gap-5 text-center">
        <p className="type-body-3 uppercase tracking-[0.18em] text-black-a50">Project walkthrough</p>
        <div className="relative w-full overflow-hidden rounded-[8px] bg-black-token shadow-[0_24px_70px_rgba(0,0,0,0.14)] ring-1 ring-black-a10">
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={`${project.title} project walkthrough`}
              className="size-full border-0"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
