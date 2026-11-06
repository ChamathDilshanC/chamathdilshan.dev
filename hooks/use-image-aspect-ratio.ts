"use client";

import { useEffect, useState } from "react";

export function useImageAspectRatio(src: string, fallback: number): number {
  const [ratio, setRatio] = useState(fallback);

  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active && image.naturalWidth && image.naturalHeight) {
        setRatio(image.naturalWidth / image.naturalHeight);
      }
    };
    image.src = src;
    return () => {
      active = false;
    };
  }, [src]);

  return ratio;
}
