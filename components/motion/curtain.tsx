"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotionRef } from "@/hooks/use-reduced-motion-ref";
import { cn } from "@/lib/cn";

type Props = {
  /** Background of the sheet; match the section it belongs to. */
  className?: string;
  /** Height of the sheet. The skew pivots around its centre. */
  heightClassName?: string;
};

/**
 * A sheet behind the top of a section. As the section scrolls into view the
 * sheet skews and rises, so the section seems to slide over the previous one
 * with a slanted leading edge.
 */
export function Curtain({ className, heightClassName = "h-208.5" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionRef();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const skewY = useTransform(scrollYProgress, (p) => (reduced.current ? 0 : -7 * p));
  const y = useTransform(scrollYProgress, (p) => (reduced.current ? 0 : -220 * p));

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 flex", heightClassName)}>
      <motion.div ref={ref} className={cn("h-full w-full will-change-transform", className)} style={{ skewY, y }} />
    </div>
  );
}
