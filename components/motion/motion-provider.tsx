"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Honours the visitor's reduced-motion setting in every Motion animation (fades stay, movement goes). */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
