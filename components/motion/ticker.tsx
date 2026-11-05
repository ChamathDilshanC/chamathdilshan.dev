"use client";

import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** Pixels per second. */
  speed?: number;
  /** Gap between items, px. */
  gap?: number;
  /** Speed multiplier while hovered (1 = no change). */
  hoverFactor?: number;
  /** Fade both edges over this % of the width. 0 disables the fade. */
  fade?: number;
  className?: string;
  itemClassName?: string;
};

/**
 * An endless horizontal marquee. Items are repeated as often as needed to
 * cover the frame, and the strip wraps seamlessly after one full set.
 */
export function Ticker({ children, speed = 50, gap = 10, hoverFactor = 1, fade = 0, className, itemClassName }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const factor = useRef(1);
  const setWidth = useRef(0);
  const [copies, setCopies] = useState(2);
  const reduce = useReducedMotion();
  const items = Children.toArray(children);

  useEffect(() => {
    const frame = frameRef.current;
    const set = setRef.current;
    if (!frame || !set) return;
    const measure = () => {
      setWidth.current = set.offsetWidth + gap;
      const needed = setWidth.current > 0 ? Math.ceil(frame.offsetWidth / setWidth.current) + 1 : 2;
      setCopies(Math.max(2, needed));
    };
    // ResizeObserver also fires once right after observe(), which does the first measurement.
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(set);
    return () => observer.disconnect();
  }, [gap]);

  useAnimationFrame((_, delta) => {
    if (reduce || setWidth.current === 0) return;
    let next = x.get() - (speed * factor.current * Math.min(delta, 64)) / 1000;
    if (next <= -setWidth.current) next += setWidth.current;
    x.set(next);
  });

  const mask: CSSProperties | undefined = fade
    ? {
        maskImage: `linear-gradient(to right, transparent 0%, #000 ${fade}%, #000 ${100 - fade}%, transparent 100%)`,
        WebkitMaskImage: `linear-gradient(to right, transparent 0%, #000 ${fade}%, #000 ${100 - fade}%, transparent 100%)`,
      }
    : undefined;

  return (
    <div
      ref={frameRef}
      className={cn("relative flex h-full w-full items-center overflow-hidden", className)}
      style={mask}
      onPointerEnter={() => (factor.current = hoverFactor)}
      onPointerLeave={() => (factor.current = 1)}
    >
      <motion.div className="flex h-full w-max shrink-0 items-center" style={{ x, gap }}>
        {Array.from({ length: copies }, (_, copy) => (
          <div
            key={copy}
            ref={copy === 0 ? setRef : undefined}
            aria-hidden={copy > 0 ? true : undefined}
            className="flex h-full shrink-0 items-center"
            style={{ gap }}
          >
            {items.map((item, i) => (
              <div key={i} className={cn("flex h-full shrink-0 items-center", itemClassName)}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
