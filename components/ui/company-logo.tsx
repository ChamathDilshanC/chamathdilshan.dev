"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { cloudinaryLoader, isCloudinary } from "@/lib/media";

/** A company logo on a small grey tile, contained rather than cropped. */
export function CompanyLogo({ src, className }: { src: string; className?: string }) {
  return (
    <span
      className={cn(
        "relative block size-11 flex-none overflow-hidden rounded-[5px] bg-neutral-50 ring-1 ring-black-a10 ring-inset",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="44px"
        draggable={false}
        unoptimized={!isCloudinary(src)}
        loader={isCloudinary(src) ? cloudinaryLoader : undefined}
        className="object-contain p-1.5"
      />
    </span>
  );
}
