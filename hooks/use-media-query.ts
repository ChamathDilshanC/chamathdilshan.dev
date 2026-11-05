"use client";

import { useSyncExternalStore } from "react";

/** Tracks a CSS media query. Returns false during server rendering. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const DESKTOP = "(min-width: 1200px)";
export const TABLET_UP = "(min-width: 810px)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
