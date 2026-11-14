"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { videoPoster, videoSrc } from "@/lib/media";
import type { MediaItem } from "@/lib/types/content";
import { Media } from "./media";

type Props = {
  item: MediaItem;
  sizes: string;
  fit?: "cover" | "contain";
  preload?: boolean;
  className?: string;
};

/**
 * An image or a looping, muted video that fills its positioned parent.
 * Videos stay paused on their poster for visitors who prefer reduced motion.
 */
export function MediaAsset({
  item,
  sizes,
  fit = "cover",
  preload,
  className,
}: Props) {
  const still = useReducedMotion();
  if (item.kind !== "video") {
    return (
      <Media
        src={item.url}
        alt={item.alt}
        sizes={sizes}
        fit={fit}
        preload={preload}
        className={className}
      />
    );
  }
  return (
    <video
      key={item.url}
      src={videoSrc(item.url)}
      poster={item.poster ?? videoPoster(item.url)}
      aria-label={item.alt || undefined}
      autoPlay={!still}
      controls={Boolean(still)}
      muted
      loop
      playsInline
      preload={preload ? "auto" : "metadata"}
      className={cn(
        "absolute inset-0 size-full rounded-[inherit] object-center",
        fit === "contain" ? "object-contain" : "object-cover",
        className,
      )}
    />
  );
}
