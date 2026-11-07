"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { cloudinaryLoader, isCloudinary } from "@/lib/media";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
};

export function ImageLightbox({ src, alt, sizes, className }: Props) {
  const [open, setOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16 / 9");

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  const preventImageAction = (event: React.SyntheticEvent) => event.preventDefault();

  return (
    <>
      <div className="relative block w-full overflow-hidden rounded-[5px]" style={{ aspectRatio }}>
        <button
          type="button"
          aria-label={`Open ${alt || "image"} in full view`}
          className="absolute inset-0 size-full cursor-zoom-in"
          onClick={() => setOpen(true)}
        >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          draggable={false}
          loader={isCloudinary(src) ? cloudinaryLoader : undefined}
          onLoad={(event) => {
            const image = event.currentTarget;
            if (image.naturalWidth && image.naturalHeight) {
              setAspectRatio(`${image.naturalWidth} / ${image.naturalHeight}`);
            }
          }}
          onContextMenu={preventImageAction}
          onDragStart={preventImageAction}
          className={cn("rounded-[inherit] object-contain object-center", className)}
        />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Image preview"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black-a60 p-5"
          onClick={() => setOpen(false)}
          onContextMenu={preventImageAction}
          onDragStart={preventImageAction}
        >
          <button
            type="button"
            aria-label="Close image preview"
            className="absolute inset-0 size-full cursor-zoom-out"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-1 h-full w-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              draggable={false}
              loader={isCloudinary(src) ? cloudinaryLoader : undefined}
              onContextMenu={preventImageAction}
              onDragStart={preventImageAction}
              className="object-contain object-center"
            />
          </div>
        </div>
      )}
    </>
  );
}
