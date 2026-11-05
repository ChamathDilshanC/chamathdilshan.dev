"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotionRef } from "@/hooks/use-reduced-motion-ref";
import { cn } from "@/lib/cn";

/**
 * Page-anchored parallax: the element drifts by `scrollY * (1 - speed / 100)`.
 * speed > 100 moves faster than the page, speed < 100 lags behind it.
 * Use it only for things that start at the top of the page (heroes).
 */
export function usePageParallax(speed: number): MotionValue<number> {
  const reduced = useReducedMotionRef();
  const { scrollY } = useScroll();
  const factor = speed / 100 - 1;
  return useTransform(scrollY, (value) => (reduced.current ? 0 : -value * factor));
}

type ParallaxProps = {
  /** 100 = no parallax. 90 lags slightly behind the scroll. */
  speed?: number;
  /** Extra height above and below the frame, in % of the frame height. */
  overscan?: number;
  /** Classes for the clipping frame: position (relative/absolute), size, rounding. */
  className?: string;
  /** Classes for the moving layer. */
  innerClassName?: string;
  children: ReactNode;
};

/**
 * Clips its children to a frame and slides them vertically while the frame
 * crosses the viewport. The offset is centred, so the content sits at rest when
 * the frame is in the middle of the screen.
 */
export function Parallax({ speed = 90, overscan = 25, className, innerClassName, children }: ParallaxProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const size = useRef({ frame: 0, viewport: 0 });
  const reduced = useReducedMotionRef();
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ["start end", "end start"] });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      size.current = { frame: frame.offsetHeight, viewport: window.innerHeight };
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const y = useTransform(scrollYProgress, (progress) => {
    if (reduced.current) return 0;
    const { frame, viewport } = size.current;
    const travel = (1 - speed / 100) * (viewport + frame);
    const limit = (overscan / 100) * frame;
    const offset = (progress - 0.5) * travel;
    return Math.max(-limit, Math.min(limit, offset));
  });

  return (
    <div ref={frameRef} className={cn("overflow-hidden", className)}>
      <motion.div
        className={cn("absolute inset-x-0 will-change-transform", innerClassName)}
        style={{ top: `-${overscan}%`, height: `${100 + overscan * 2}%`, y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
