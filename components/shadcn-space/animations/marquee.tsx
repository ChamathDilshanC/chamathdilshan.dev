// Adapted from @shadcn-space/marquee-02. Keep animation styles scoped to this component.
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./marquee.module.css";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({ className, reverse = false, pauseOnHover = false, children, vertical = false, repeat = 4, ...props }: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        styles.root,
        vertical ? "flex-col" : "flex-row",
        pauseOnHover && styles.pauseOnHover,
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 ? true : undefined}
          className={cn(
            "flex min-w-full shrink-0 items-center justify-around gap-(--gap)",
            styles.track,
            vertical ? ["flex-col", styles.vertical] : "flex-row",
            reverse && styles.reverse,
            i > 0 && styles.duplicate,
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
