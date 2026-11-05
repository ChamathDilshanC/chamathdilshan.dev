"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * The visitor's reduced-motion preference as a ref, read inside scroll-linked
 * transforms. Unlike a render-time value it never changes the server-rendered
 * markup, so it cannot cause hydration mismatches.
 */
export function useReducedMotionRef(): RefObject<boolean> {
  const ref = useRef(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      ref.current = mql.matches;
    };
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return ref;
}
