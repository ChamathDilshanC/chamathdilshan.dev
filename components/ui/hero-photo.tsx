"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotionRef } from "@/hooks/use-reduced-motion-ref";
import { cn } from "@/lib/cn";
import { heroImageEnter } from "@/lib/enter";
import { SCROLL_SPRING } from "@/lib/motion";
import { Media } from "./media";

/**
 * Slow zoom-in while the nearest `group/hero` is hovered, easing back out on
 * leave. Hover-capable pointers only, and never for reduced motion. Touch
 * screens get a slow ambient drift instead (`hero-drift` in globals.css).
 */
export const heroZoom =
  "hero-drift transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/hero:scale-[1.06]";

type Props = {
  /** The sharp photo or video; it fills the 16:9 frame. */
  children: ReactNode;
  /** Image blurred into the space beside the frame on screens wider than 16:9. */
  fill?: string | null;
  /** Zoom in while the hero (marked `group/hero`) is hovered. */
  zoom?: boolean;
  /** Gently zoom the photo as the hero scrolls away. */
  scrollZoom?: boolean;
  className?: string;
};

/**
 * Full-screen hero backdrop that shows a whole 16:9 photo.
 *
 * The frame is always as tall as the hero and 16:9 wide. On screens wider
 * than 16:9 it sits in the middle and its edges fade into a soft blur of the
 * same photo; on narrower screens it overflows and only the sides are
 * trimmed, so heads and feet are never cut off. Zooms out on load.
 */
export function HeroPhoto({ children, fill, zoom = false, scrollZoom = false, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionRef();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useSpring(
    useTransform(scrollYProgress, (progress) => (reduced.current || !scrollZoom ? 1 : 1 + progress * 0.04)),
    SCROLL_SPRING,
  );

  return (
    <div ref={ref} className={cn("absolute inset-0 overflow-clip", className)}>
      <motion.div className="absolute inset-0" style={{ scale }}>
        <div className="animate-enter absolute inset-0" style={heroImageEnter}>
          <div className={cn("absolute inset-0", zoom ? heroZoom : "hero-drift")}>
            {/* Stretched rather than cropped, so its floor and horizon line up with the photo's. */}
            {fill && (
              <div aria-hidden className="absolute -inset-[4%] hidden blur-2xl [@media(min-aspect-ratio:16/9)]:block">
                <Media src={fill} sizes="25vw" className="object-fill!" />
              </div>
            )}
            <div className="absolute top-0 left-1/2 aspect-video h-full -translate-x-1/2 [@media(min-aspect-ratio:16/9)]:[mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
