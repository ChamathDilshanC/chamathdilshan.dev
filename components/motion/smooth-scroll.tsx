"use client";

import Lenis from "lenis";
import { cancelFrame, frame } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { SMOOTH_SCROLL } from "@/lib/motion";

type Props = {
  /** Share of the remaining distance covered per frame. Lower is slower and silkier. */
  lerp?: number;
  /** Distance per wheel notch (1 = browser default). */
  wheelMultiplier?: number;
};

/**
 * Site-wide inertial scrolling (Lenis).
 *
 * - Lenis runs inside Motion's frame loop, in the "setup" step that comes
 *   before every read. Scroll-linked effects (parallax, curtains, sticky
 *   hero) therefore measure the position Lenis set in the same frame, so
 *   they never trail the page by a frame and never stutter.
 * - Touch keeps the device's native momentum scrolling.
 * - Disabled when the visitor prefers reduced motion.
 * - Pauses while any element carries `data-stop-scroll`, or while
 *   `<html>` has `overflow: hidden` (open menus, dialogs).
 * - Native scroll position stays the source of truth, so anchors,
 *   keyboard scrolling and scroll restoration keep working.
 */
export function SmoothScroll({ lerp = SMOOTH_SCROLL.lerp, wheelMultiplier = SMOOTH_SCROLL.wheelMultiplier }: Props) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp, wheelMultiplier, smoothWheel: true, anchors: true, autoRaf: false });
    lenisRef.current = lenis;

    const tick = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
    frame.setup(tick, true);

    const root = document.documentElement;
    const sync = () => {
      const blocked = document.querySelector("[data-stop-scroll]") || root.style.overflow === "hidden";
      if (blocked) lenis.stop();
      else lenis.start();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-stop-scroll", "style"],
    });

    return () => {
      cancelFrame(tick);
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [lerp, wheelMultiplier]);

  // New page, new height: let Lenis re-measure and drop any leftover momentum.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.resize();
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
