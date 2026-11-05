"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { cloudinaryLoader, isCloudinary } from "@/lib/media";

type Props = {
  src: string;
  alt?: string;
  /** Rendered width hint for responsive loading, e.g. "(min-width: 1200px) 50vw, 100vw". */
  sizes: string;
  /** Load immediately with high priority (above-the-fold images only). */
  preload?: boolean;
  className?: string;
};

/**
 * A cover-fitted image that fills its positioned parent.
 * Cloudinary images are sized and converted by Cloudinary; local ones by Next.js.
 */
export function Media({ src, alt = "", sizes, preload = false, className }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      draggable={false}
      loader={isCloudinary(src) ? cloudinaryLoader : undefined}
      className={cn("rounded-[inherit] object-cover object-center", className)}
    />
  );
}
