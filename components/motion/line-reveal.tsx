"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { EASE_SOFT } from "@/lib/motion";

type Props = {
  text: string;
  /** Typography and colour classes. Set `--indent` to indent the first line. */
  className?: string;
  /** Render lines from the second half of the text at 50% opacity. */
  dimSecondHalf?: boolean;
  /** Delay between lines, seconds. */
  stagger?: number;
  /** Duration of each line, seconds. */
  duration?: number;
};

/**
 * Large statement text that rises into view line by line.
 *
 * The text is laid out once, invisibly, to find where the browser breaks the
 * lines (the same layout reserves the final height, so nothing shifts). Each
 * measured line is then drawn in its own clipping row and slides up into it.
 */
export function LineReveal({ text, className, dimSecondHalf = false, stagger = 0.1, duration = 0.7 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[] | null>(null);
  const inView = useInView(containerRef, { once: true, amount: 0 });
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const measure = measureRef.current;
    if (!measure) return;

    const split = () => {
      const node = measure.firstChild;
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      const range = document.createRange();
      const found: string[] = [];
      let current = "";
      let bottom = -1;
      for (let i = 0; i < text.length; i++) {
        range.setStart(node, 0);
        range.setEnd(node, i + 1);
        const rectBottom = range.getBoundingClientRect().bottom;
        if (bottom === -1) bottom = rectBottom;
        if (rectBottom > bottom + 2) {
          found.push(current);
          current = text[i] ?? "";
          bottom = rectBottom;
        } else {
          current += text[i] ?? "";
        }
      }
      if (current) found.push(current);
      setLines((previous) =>
        previous && previous.length === found.length && previous.every((line, i) => line === found[i])
          ? previous
          : found,
      );
    };

    // ResizeObserver fires once right after observe() (before paint), which does
    // the first split; later firings track width changes.
    let frame = 0;
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false;
        split();
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(split);
    });
    observer.observe(measure);
    document.fonts?.ready.then(split).catch(() => undefined);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [text]);

  const half = text.length / 2;
  // Character offset at which each line starts.
  const starts = (lines ?? []).map((_, i, all) => all.slice(0, i).reduce((sum, line) => sum + line.length, 0));

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <span
        ref={measureRef}
        aria-hidden
        className={cn("block whitespace-pre-wrap [text-indent:var(--indent,0)]", lines ? "invisible" : "opacity-0")}
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
      {lines && (
        <span aria-hidden className="absolute inset-0 flex flex-col">
          {lines.map((line, index) => {
            const start = starts[index] ?? 0;
            return (
              <span
                key={`${index}-${line}`}
                className={cn("block overflow-hidden", index === 0 && "pl-[var(--indent,0)]")}
              >
                <motion.span
                  className="inline-block whitespace-pre-wrap will-change-transform"
                  style={{ opacity: dimSecondHalf && start >= half ? 0.5 : 1 }}
                  initial={reduce ? false : { y: 70 }}
                  animate={inView || reduce ? { y: 0 } : { y: 70 }}
                  transition={{ delay: index * stagger, duration, ease: EASE_SOFT }}
                >
                  {index === 0 ? line.trimStart() : line}
                </motion.span>
              </span>
            );
          })}
        </span>
      )}
    </div>
  );
}
