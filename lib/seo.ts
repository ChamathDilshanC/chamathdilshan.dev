import type { Metadata } from "next";
import { createElement, type ReactNode } from "react";

export const siteUrl = "https://www.chamathdilshan.com";

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function imageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : absoluteUrl(url);
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrlValue = imageUrl(image);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title,
      description,
      url,
      ...(imageUrlValue ? { images: [imageUrlValue] } : {}),
      ...(type === "article" ? {} : { siteName: "Chamath Dilshan" }),
    },
    twitter: {
      card: imageUrlValue ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrlValue ? { images: [imageUrlValue] } : {}),
    },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }): ReactNode {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: json },
  });
}
