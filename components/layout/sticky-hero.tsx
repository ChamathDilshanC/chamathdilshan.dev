"use client";

import { motion, useMotionValue, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { usePageParallax } from "@/components/motion/parallax";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
  /** Parallax speed of the whole hero (100 = none). */
  speed?: number;
};

/**
 * A full-screen hero pinned to the top of the page. The next section slides
 * up over it; while it does, the hero drifts upward a little faster than the
 * page and fades out.
 */
export function StickyHero({ children, className, speed = 110 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const y = usePageParallax(speed);
  const fade = useMotionValue(1);
  const opacity = useSpring(fade, { stiffness: 500, damping: 60, mass: 1 });

  useEffect(() => {
    const hero = ref.current;
    const next = hero?.nextElementSibling as HTMLElement | null;
    if (!hero || !next) return;

    // Fade across the scroll range in which the next section covers the hero.
    // Until that range is measured the hero stays fully visible, so a reload at
    // a scrolled position can never leave it transparent.
    let start = 0;
    let end = Number.POSITIVE_INFINITY;
    let measured = false;

    const update = () => {
      fade.set(1 - Math.min(1, Math.max(0, (scrollY.get() - start) / (end - start))));
    };

    const measure = () => {
      let top = 0;
      for (let el: HTMLElement | null = next; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
      start = Math.max(top - window.innerHeight, 0);
      end = Math.max(start + 1, top - window.innerHeight + next.offsetHeight);
      update();
      if (!measured) {
        // First measurement (page load or reload mid-page): show the right
        // opacity at once instead of animating to it.
        measured = true;
        opacity.jump(fade.get());
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(next);
    window.addEventListener("resize", measure);
    const unsubscribe = scrollY.on("change", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      unsubscribe();
    };
  }, [fade, opacity, scrollY]);

  return (
    <motion.section
      ref={ref}
      className={cn(
        "sticky top-0 z-1 flex h-svh w-full flex-none flex-col items-center overflow-clip will-change-[transform,opacity]",
        className,
      )}
      style={{ opacity, y }}
    >
      {children}
    </motion.section>
  );
}
