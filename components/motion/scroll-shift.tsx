"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { useReducedMotionRef } from "@/hooks/use-reduced-motion-ref";
import { cn } from "@/lib/cn";
import { SCROLL_SPRING } from "@/lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Horizontal offset (px) at the top of the page; it eases to 0 at the bottom. */
  from?: number;
};

/** Slides its content sideways as the whole page is scrolled. */
export function ScrollShift({ children, className, from = 1000 }: Props) {
  const reduced = useReducedMotionRef();
  const { scrollYProgress } = useScroll();
  const x = useSpring(
    useTransform(scrollYProgress, (p) => (reduced.current ? 0 : from * (1 - p))),
    SCROLL_SPRING,
  );
  // Reduced motion: start at rest instead of springing there on the first scroll.
  useEffect(() => {
    if (reduced.current) x.jump(0);
  }, [reduced, x]);
  return (
    <motion.div className={cn("will-change-transform", className)} style={{ x }}>
      {children}
    </motion.div>
  );
}
