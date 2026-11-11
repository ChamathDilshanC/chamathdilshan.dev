"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ProximitySidebar, { type ProximitySection } from "@/components/ui/proximity-sidebar";

const SECTION_SELECTOR = "main h1, main h2, main h3";

function sectionId(index: number, heading: HTMLElement) {
  return heading.id || `page-section-${index + 1}`;
}

/** Provides a section map for every public page without requiring page-specific wiring. */
export function PageProximitySidebar() {
  const pathname = usePathname();
  const [sections, setSections] = useState<ProximitySection[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const headings = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
      const nextSections = headings.map((heading, index) => {
        const id = sectionId(index, heading);
        heading.id = id;
        return {
          id,
          label: heading.textContent?.trim() || `Section ${index + 1}`,
          level: Number(heading.tagName.slice(1)) as ProximitySection["level"],
        };
      });
      setSections(nextSections);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  if (sections.length < 2) return null;

  return (
    <div className="pointer-events-none fixed top-1/2 right-0 z-30 max-h-[70vh] -translate-y-1/2 overflow-y-auto mix-blend-difference">
      <div className="pointer-events-auto">
        <ProximitySidebar sections={sections} side="right" className="w-34" />
      </div>
    </div>
  );
}
