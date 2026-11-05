import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Media } from "@/components/ui/media";
import { SectionTitle } from "@/components/ui/section-title";
import type { HomeWork, Project } from "@/lib/types/content";
import { WorkStack } from "./work-stack";

function SeeAllPill({ count, image }: { count: number; image: string }) {
  return (
    <Link
      href="/projects"
      className="touch-press group flex h-min w-min cursor-pointer items-center justify-start gap-4 overflow-clip rounded-[5px] bg-neutral-50 py-0.75 pr-4 pl-0.75"
    >
      <span className="relative flex h-16 w-16 flex-none overflow-hidden rounded-[2.5px] bg-black-token">
        <span className="absolute inset-0 transition-[scale,opacity] duration-400 ease-[cubic-bezier(0.64,0.03,0.21,1)] group-hover:scale-110 group-hover:opacity-90">
          <Media src={image} sizes="64px" />
        </span>
      </span>
      <span className="whitespace-pre type-body-1 text-black-token">See all ({String(count).padStart(2, "0")})</span>
    </Link>
  );
}

export function SelectedWork({ work, projects }: { work: HomeWork; projects: Project[] }) {
  const featured = projects.filter((project) => project.featured);
  if (featured.length === 0) return null;
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-6 pb-20 m:gap-20 m:pb-30">
      <div className="w-full max-w-360">
        <SectionTitle title={work.title} aside={work.aside} />
      </div>
      <Reveal
        duration={0.8}
        className="flex w-full max-w-360 flex-col gap-10 m:gap-12.5 l:flex-row l:items-start l:justify-between l:gap-0"
      >
        <div className="flex w-full max-w-62.5 flex-col gap-4 l:sticky l:top-0 l:flex-1 l:py-50">
          <h2 className="type-heading-4">{work.title}</h2>
          <div className="h-px w-full bg-black-a16" />
          <ArrowLink href={work.cta.href} variant="dark">
            {work.cta.label}
          </ArrowLink>
        </div>
        <WorkStack projects={featured} />
        <div className="flex w-full max-w-62.5 l:sticky l:top-0 l:flex-1 l:justify-center l:py-50">
          <SeeAllPill count={projects.length} image={work.seeAllThumb} />
        </div>
      </Reveal>
    </section>
  );
}
