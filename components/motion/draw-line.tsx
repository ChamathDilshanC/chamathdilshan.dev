"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE_SOFT } from "@/lib/motion";

type Props = {
  /** Size and position of the rule. */
  className?: string;
  /** Colour of the rule, e.g. "bg-black-a16". */
  lineClassName?: string;
  /** Seconds. */
  delay?: number;
};

/**
 * A vertical rule that draws itself downwards the first time it scrolls into
 * view; reduced motion shows it fully drawn. The full-height wrapper is what
 * gets observed — a line scaled to zero has no height, so it would never
 * count as in view once its top is above the viewport.
 */
export function DrawLine({ className, lineClassName, delay = 0 }: Props) {
  return (
    <motion.span
      aria-hidden
      className={cn("block", className)}
      initial="hidden"
      whileInView="drawn"
      viewport={{ once: true, amount: 0 }}
    >
      <motion.span
        className={cn("block size-full origin-top", lineClassName)}
        variants={{ hidden: { scaleY: 0 }, drawn: { scaleY: 1 } }}
        transition={{ duration: 1.1, delay, ease: EASE_SOFT, type: "tween" }}
      />
    </motion.span>
  );
}
