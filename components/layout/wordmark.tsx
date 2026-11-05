"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useSiteContent } from "./site-content";

type Props = {
  text?: string;
  /** Accessible name; defaults to the full site name. */
  label?: string;
  /** Letters rise in one by one on load. */
  animated?: boolean;
  className?: string;
};

/**
 * Giant heavy-weight letters that span the full width of their container.
 *
 * Sized in container query units, so it scales with its box. The server
 * renders an estimate; once the font has loaded the real letter widths are
 * measured and the size is corrected to fit exactly, whatever the word.
 */
export function Wordmark({ text: textProp, label: labelProp, animated = true, className }: Props) {
  const { site } = useSiteContent();
  const text = textProp ?? site.wordmark;
  const label = labelProp ?? site.name;
  const lineRef = useRef<HTMLSpanElement>(null);
  const letters = Array.from(text);
  const estimate = `${(100 / (letters.length * 0.74)).toFixed(2)}cqw`;

  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const fit = () => {
      const fontSize = parseFloat(getComputedStyle(line).fontSize);
      const natural = Array.from(line.children).reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
      if (!fontSize || !natural) return;
      // Width per pixel of font size is constant, so the fitting size in cqw is too.
      line.style.fontSize = `${((100 * fontSize) / natural) * 0.995}cqw`;
    };
    fit();
    document.fonts?.ready.then(fit).catch(() => undefined);
  }, [text]);

  return (
    <span role="img" aria-label={label} className={cn("block w-full [container-type:inline-size]", className)}>
      <span
        ref={lineRef}
        aria-hidden
        className="flex w-full justify-between overflow-hidden font-geist leading-[0.8] font-black tracking-[-0.04em] whitespace-nowrap"
        style={{ fontSize: estimate }}
      >
        {letters.map((letter, i) => (
          <span
            key={i}
            className={animated ? "wordmark-letter" : "inline-block"}
            style={{ "--i": i } as CSSProperties}
          >
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}
