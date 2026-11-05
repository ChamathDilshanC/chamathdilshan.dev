"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotionRef } from "@/hooks/use-reduced-motion-ref";
import { cn } from "@/lib/cn";
import { SCROLL_SPRING } from "@/lib/motion";

type Props = {
  children: ReactNode;
  /** Frame classes: size, rounding. */
  className?: string;
  /** Starting scale; settles to 1 as the frame scrolls fully into view. */
  from?: number;
};

/** Content that starts zoomed in and eases back to its natural size on scroll. */
export function ScrollScale({ children, className, from = 1.25 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionRef();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useSpring(
    useTransform(scrollYProgress, (p) => (reduced.current ? 1 : from + (1 - from) * p)),
    SCROLL_SPRING,
  );
  // Reduced motion: start at rest instead of springing there on the first scroll.
  useEffect(() => {
    if (reduced.current) scale.jump(1);
  }, [reduced, scale]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div ref={ref} className="absolute inset-0 rounded-[inherit] will-change-transform" style={{ scale }}>
        {children}
      </motion.div>
    </div>
  );
}
