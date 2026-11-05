"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";

/** Honours the visitor's reduced-motion setting in every Motion animation (fades stay, movement goes). */
export function MotionProvider({ children }: { children: ReactNode }) {
  // iOS Safari only applies :active (the `touch-press` feedback) when the page
  // listens for touches. An empty passive listener is enough and never delays scrolling.
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
