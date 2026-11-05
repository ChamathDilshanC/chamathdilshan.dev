"use client";

import { createContext, useContext } from "react";
import type { SiteContent } from "@/lib/types/content";

const SiteContentContext = createContext<SiteContent | null>(null);

/** Hands the server-fetched site content to client components (header, FAQ, forms…). */
export function SiteContentProvider({ value, children }: { value: SiteContent; children: React.ReactNode }) {
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
  const value = useContext(SiteContentContext);
  if (!value) throw new Error("useSiteContent must be used inside <SiteContentProvider>");
  return value;
}
