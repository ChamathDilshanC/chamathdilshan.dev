import type { CSSProperties } from "react";

/**
 * Inline variables for the CSS `.animate-enter` keyframes (see globals.css).
 * Pure CSS, so server-rendered markup animates before hydration.
 */
export function enter(
  delay: number,
  options: { y?: string; scale?: number; opacity?: number; duration?: string; ease?: string } = {},
): CSSProperties {
  const { y = "32px", scale, opacity, duration = "var(--hero-duration)", ease = "var(--hero-ease)" } = options;
  const style: Record<string, string> = {
    "--enter-y": y,
    "--enter-delay": `${delay}s`,
    "--enter-duration": duration,
    "--enter-ease": ease,
  };
  if (scale !== undefined) style["--enter-scale"] = String(scale);
  if (opacity !== undefined) style["--enter-opacity"] = String(opacity);
  return style as CSSProperties;
}

/** Slow zoom-out used by full-bleed hero images. */
export const heroImageEnter = enter(0, { y: "0px", scale: 1.15, opacity: 1, duration: "2.6s" });
