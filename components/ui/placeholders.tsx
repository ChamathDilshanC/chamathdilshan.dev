"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

const Placeholders = createContext<Readonly<Record<string, string>>>({});

/**
 * Blurred previews (data URLs from lib/placeholders.ts) keyed by image URL.
 * Every `<Media>` inside shows the preview for its image while it loads.
 * Nested providers add to the outer one.
 */
export function PlaceholderProvider({ value, children }: { value: Record<string, string>; children: ReactNode }) {
  const outer = useContext(Placeholders);
  const merged = useMemo(() => ({ ...outer, ...value }), [outer, value]);
  return <Placeholders.Provider value={merged}>{children}</Placeholders.Provider>;
}

/** The preview for an image, if one was provided. */
export function usePlaceholder(src: string): string | undefined {
  return useContext(Placeholders)[src];
}
