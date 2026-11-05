/**
 * Cloudinary delivery helpers.
 *
 * Uploaded images are resized, compressed and converted (AVIF/WebP) by
 * Cloudinary itself through URL transformations, so next/image only asks for
 * the width it needs instead of re-optimising the file.
 */

import type { ImageLoaderProps } from "next/image";

const CLOUDINARY = "https://res.cloudinary.com/";

export const isCloudinary = (src: string) => src.startsWith(CLOUDINARY);

/** Insert a transformation right after `/upload/`. */
function transform(src: string, kind: "image" | "video", params: string): string {
  const marker = `/${kind}/upload/`;
  const at = src.indexOf(marker);
  if (at === -1) return src;
  const head = src.slice(0, at + marker.length);
  return `${head}${params}/${src.slice(at + marker.length)}`;
}

/** next/image loader for Cloudinary image URLs. */
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.includes("/image/upload/")) return src;
  return transform(src, "image", `f_auto,q_${quality ?? "auto"},c_limit,w_${width}`);
}

/** Cloudinary videos: automatic quality and codec for the visitor's browser. */
export function videoSrc(src: string): string {
  return isCloudinary(src) ? transform(src, "video", "q_auto,vc_auto") : src;
}

/** First frame of a Cloudinary video as a JPEG, for the poster. */
export function videoPoster(src: string): string | undefined {
  if (!isCloudinary(src) || !src.includes("/video/upload/")) return undefined;
  const withoutExt = src.replace(/\.[a-z0-9]+$/i, "");
  return `${transform(withoutExt, "video", "so_0,f_jpg,q_auto,c_limit,w_1600")}.jpg`;
}

/** A small preview thumbnail for the admin panel. */
export function thumbnail(src: string, width = 320): string {
  if (!isCloudinary(src)) return src;
  if (src.includes("/video/upload/")) return videoPoster(src)?.replace("w_1600", `w_${width}`) ?? src;
  return cloudinaryLoader({ src, width, quality: undefined });
}
