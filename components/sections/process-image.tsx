"use client";

import { Parallax } from "@/components/motion/parallax";
import { Media } from "@/components/ui/media";
import { useImageAspectRatio } from "@/hooks/use-image-aspect-ratio";
import type { CSSProperties } from "react";

type Props = {
  src: string;
  alt: string;
};

export function ProcessImage({ src, alt }: Props) {
  const ratio = useImageAspectRatio(src, 2400 / 1100);

  return (
    <Parallax
      className="relative aspect-[var(--image-aspect)] w-full rounded-[5px] m:aspect-auto m:h-svh l:h-[80vh]"
      style={{ "--image-aspect": ratio } as CSSProperties}
    >
      <Media src={src} alt={alt} sizes="100vw" />
    </Parallax>
  );
}
