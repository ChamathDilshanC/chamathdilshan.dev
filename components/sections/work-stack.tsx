"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { WorkCard } from "@/components/cards/work-card";
import type { Project } from "@/lib/types/content";
import { DESKTOP, useMediaQuery } from "@/hooks/use-media-query";

function StackCard({
  project,
  index,
  total,
  progress,
  stacked,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  stacked: boolean;
}) {
  // Each card shrinks a little more the earlier it sits in the pile.
  const scale = useTransform(progress, [index / total, 1], [1, 1 - (total - 1 - index) * 0.05]);
  return (
    <motion.div className="w-full origin-top l:sticky" style={stacked ? { scale, top: 50 + 40 * index } : undefined}>
      <Link href={`/projects/${project.slug}`} className="block bg-white-token">
        <WorkCard project={project} sizes="(min-width: 1200px) 800px, 100vw" />
      </Link>
    </motion.div>
  );
}

/** Case studies that pile up on top of each other while the list scrolls (desktop). */
export function WorkStack({ projects }: { projects: readonly Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const stacked = useMediaQuery(DESKTOP);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} className="flex w-full flex-col gap-10 m:gap-12.5 l:max-w-223 l:flex-1 l:gap-20 l:px-11.5">
      {projects.map((project, index) => (
        <StackCard
          key={project.slug}
          project={project}
          index={index}
          total={projects.length}
          progress={scrollYProgress}
          stacked={stacked}
        />
      ))}
    </div>
  );
}
