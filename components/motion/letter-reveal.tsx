"use client";

import { useInView } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Props = {
  text: string;
  as?: "h1" | "h2" | "p";
  /** Typography classes. Set `--indent` to indent the first line. */
  className?: string;
  /** Delay between letters, ms. */
  stagger?: number;
};

/**
 * Text whose letters fade and rise in one after another when it scrolls into
 * view. Words never break across lines.
 */
export function LetterReveal({ text, as: Tag = "h2", className, stagger = 12 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const words = text.split(" ");
  // Index of the first letter of each word, for the stagger delay.
  const firstLetter = words.map((_, w) => words.slice(0, w).reduce((sum, word) => sum + Array.from(word).length, 0));

  return (
    <div ref={ref} className="w-full" data-in={inView ? "" : undefined}>
      <Tag className={cn("[text-indent:var(--indent,0)]", className)}>
        <span className="sr-only">{text}</span>
        <span aria-hidden>
          {words.map((word, w) => (
            <span key={w}>
              <span className="whitespace-nowrap">
                {Array.from(word).map((char, c) => (
                  <span
                    key={c}
                    className="letter-in"
                    style={{ "--i": (firstLetter[w] ?? 0) + c, "--stagger": `${stagger}ms` } as CSSProperties}
                  >
                    {char}
                  </span>
                ))}
              </span>
              {w < words.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      </Tag>
    </div>
  );
}
