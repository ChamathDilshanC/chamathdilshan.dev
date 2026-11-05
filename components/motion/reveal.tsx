"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { EASE_SOFT } from "@/lib/motion";

type Props = HTMLMotionProps<"div"> & {
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
  /** Start offset in px. 0 means a pure fade. */
  y?: number;
};

/** Fades (and optionally lifts) its children in the first time they enter the viewport. */
export function Reveal({ duration = 1.2, delay = 0, y = 0, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ duration, delay, ease: EASE_SOFT, type: "tween" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
