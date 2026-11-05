"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavKey } from "@/lib/types/content";
import { useSiteContent } from "./site-content";
import { NavItem } from "./nav-item";

type Nav = ReturnType<typeof useSiteContent>["navigation"]["items"];

function activeKey(nav: Nav, pathname: string): NavKey {
  const match = nav.find((item) => item.href !== "/" && pathname.startsWith(item.href));
  return match?.key ?? "home";
}

/** Footer link list: the current page is lit, the rest sit at 50% until hovered. */
export function FooterNav() {
  const nav = useSiteContent().navigation.items;
  const active = activeKey(nav, usePathname());
  const [hovered, setHovered] = useState<NavKey | null>(null);

  return (
    <nav aria-label="Footer" className="flex w-full flex-col items-start justify-center gap-2.5">
      {nav.map((item, i) => (
        <div key={item.key} className="flex w-full flex-col gap-2.5">
          <NavItem
            href={item.href}
            title={item.title}
            number={String(i + 1).padStart(2, "0")}
            current={item.key === active}
            dimmed={item.key !== active && hovered !== item.key}
            onHover={(on) => setHovered(on ? item.key : null)}
          />
          <div className="h-px w-full bg-white-a16" />
        </div>
      ))}
    </nav>
  );
}
