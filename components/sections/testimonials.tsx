"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import Link from "next/link";
import { Fragment, useState, type KeyboardEvent, type ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Media } from "@/components/ui/media";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/cn";
import { EASE_HERO, EASE_SWAP } from "@/lib/motion";
import { QUOTE } from "@/lib/typography";
import type { HomeTestimonials, Project, Testimonial } from "@/lib/types/content";

type Item = Testimonial;
type Cover = Pick<Project, "slug" | "title" | "thumbnail">;

const quoteBlock: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.012 } },
  exit: (dir: number) => ({ opacity: 0, y: -16 * dir, filter: "blur(6px)", transition: { duration: 0.35, ease: EASE_SWAP } }),
};
const quoteWord: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: 18 * dir, filter: "blur(8px)" }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_HERO } },
};
const imageSwap: Variants = {
  enter: (dir: number) => ({
    clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
    scale: 1.12,
    zIndex: 1,
  }),
  center: { clipPath: "inset(0% 0% 0% 0%)", scale: 1, zIndex: 1, transition: { duration: 0.9, ease: EASE_SWAP } },
  exit: { zIndex: 0, filter: "brightness(0.6)", transition: { duration: 0.9, ease: EASE_SWAP } },
};
const digitRoll: Variants = {
  enter: (dir: number) => ({ y: `${100 * dir}%`, opacity: 0 }),
  center: { y: "0%", opacity: 1, transition: { duration: 0.6, ease: EASE_SWAP } },
  exit: (dir: number) => ({ y: `${-100 * dir}%`, opacity: 0, transition: { duration: 0.6, ease: EASE_SWAP } }),
};
const personSlide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: 12 * dir }),
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_HERO, delay: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

/**
 * Renders every item invisibly in one grid cell (so the box always fits the
 * largest), then animates the active one on top.
 */
function SwapStack({
  nodes,
  index,
  direction,
  variants,
  className,
}: {
  nodes: ReactNode[];
  index: number;
  direction: number;
  variants: Variants;
  className?: string;
}) {
  return (
    <div className={cn("grid", className)}>
      {nodes.map((node, i) => (
        <div key={i} aria-hidden className="invisible [grid-area:1/1]">
          {node}
        </div>
      ))}
      <div className="relative [grid-area:1/1]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            {nodes[index]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Quote({ text, animated, direction }: { text: string; animated: boolean; direction: number }) {
  const words = `“${text}”`.split(" ");
  if (!animated) return <p className={QUOTE}>{words.join(" ")}</p>;
  return (
    <p className={QUOTE}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <motion.span custom={direction} variants={quoteWord} className="inline-block indent-0">
            {word}
          </motion.span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </p>
  );
}

function CoverImage({ item, project }: { item: Item; project?: Cover }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[5px] bg-neutral-900">
      {project && <Media src={project.thumbnail.url} sizes="212px" />}
      <div className="absolute inset-0 flex items-center justify-center bg-black/15">
        <span className="font-geist text-[20px] font-semibold tracking-[-0.04em] text-white-token">
          {project?.title ?? item.company}
        </span>
      </div>
    </div>
  );
}

function Person({ item }: { item: Item }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="type-body-1 text-black-token">{item.name}</p>
      <p className="type-body-3 text-black-a60">
        {item.company} / {item.role}
      </p>
    </div>
  );
}

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={cn("size-4", flip && "rotate-180")}>
      <path d="M10 3 5 8l5 5" />
    </svg>
  );
}

function Controls({
  index,
  direction,
  go,
  count,
  className,
}: {
  index: number;
  direction: number;
  go: (step: number) => void;
  count: number;
  className?: string;
}) {
  const button =
    "flex size-16.5 cursor-pointer items-center justify-center rounded-[5px] bg-neutral-50 text-black-token transition-colors duration-200 hover:bg-black-token hover:text-white-token";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button type="button" aria-label="Previous testimonial" className={button} onClick={() => go(-1)}>
        <Chevron />
      </button>
      <button type="button" aria-label="Next testimonial" className={button} onClick={() => go(1)}>
        <Chevron flip />
      </button>
      <div aria-hidden className="ml-3 flex items-center gap-1 type-body-3 text-black-a60">
        <SwapStack
          className="overflow-hidden"
          index={index}
          direction={direction}
          variants={digitRoll}
          nodes={Array.from({ length: count }, (_, i) => (
            <span key={i} className="text-black-token">
              {String(i + 1).padStart(2, "0")}
            </span>
          ))}
        />
        <span>/ {String(count).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

function Carousel({ items, projects }: { items: Item[]; projects: Cover[] }) {
  const [[index, direction], setState] = useState<[number, number]>([0, 1]);
  const go = (step: number) => setState(([current]) => [(current + step + items.length) % items.length, step]);
  const item = items[index] ?? items[0];
  const projectFor = (entry: Item) => projects.find((p) => p.slug === entry.project);
  if (!item) return null;
  const current = projectFor(item);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  };

  return (
    <motion.div
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onKeyDown={onKeyDown}
      onPanEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 60 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) go(info.offset.x < 0 ? 1 : -1);
      }}
      style={{ touchAction: "pan-y" }}
      className="flex w-full flex-col gap-15 l:flex-row l:gap-0"
    >
      <div className="hidden w-[32%] flex-none flex-col justify-between gap-10 l:flex">
        <div className="flex w-53 flex-col gap-5">
          <Link
            href={current ? `/projects/${current.slug}` : "/projects"}
            aria-label={`${current?.title ?? item.company} case study`}
            className="relative h-63.25 w-53 overflow-hidden rounded-[5px]"
          >
            <SwapStack
              index={index}
              direction={direction}
              variants={imageSwap}
              nodes={items.map((entry, i) => (
                <div key={i} className="relative h-63.25 w-53">
                  <CoverImage item={entry} project={projectFor(entry)} />
                </div>
              ))}
            />
          </Link>
          <SwapStack
            index={index}
            direction={direction}
            variants={personSlide}
            nodes={items.map((entry, i) => (
              <Person key={i} item={entry} />
            ))}
          />
        </div>
        <Controls index={index} direction={direction} go={go} count={items.length} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-15 m:gap-20">
        <div aria-live="polite">
          <span className="sr-only">
            {item.name}, {item.role} at {item.company}: {item.quote}
          </span>
          <div aria-hidden>
            <SwapStack
              index={index}
              direction={direction}
              variants={quoteBlock}
              nodes={items.map((entry, i) => (
                <Quote key={i} text={entry.quote} direction={direction} animated={i === index} />
              ))}
            />
          </div>
        </div>
        <SwapStack
          className="-mt-5 m:-mt-10 l:hidden"
          index={index}
          direction={direction}
          variants={personSlide}
          nodes={items.map((entry, i) => (
            <Person key={i} item={entry} />
          ))}
        />
        <Controls className="l:hidden" index={index} direction={direction} go={go} count={items.length} />
      </div>
    </motion.div>
  );
}

export function Testimonials({ testimonials, projects }: { testimonials: HomeTestimonials; projects: Cover[] }) {
  if (testimonials.items.length === 0) return null;
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-27.5 bg-white-token px-6 pt-6 pb-20 m:pb-30">
      <div className="flex w-full max-w-360 flex-col items-center justify-center gap-15 m:gap-20">
        <SectionTitle title={testimonials.title} aside={testimonials.aside} />
        <Reveal className="w-full">
          <Carousel items={testimonials.items} projects={projects} />
        </Reveal>
      </div>
    </section>
  );
}
