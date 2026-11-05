"use client";

import Link from "next/link";
import { enter } from "@/lib/enter";
import { useSiteContent } from "./site-content";

/** Header logo: a small crescent mark and the name in heavy caps. */
export function Logo() {
  const { site } = useSiteContent();
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className="animate-enter relative flex h-4.5 flex-none items-center gap-1.5 text-white-token"
      style={enter(0.6, { y: "20%" })}
    >
      <span
        aria-hidden
        className="block size-3.25 rounded-full bg-current [mask:radial-gradient(circle_at_72%_28%,transparent_34%,#000_35%)]"
      />
      <span className="font-geist text-[15px] leading-none font-extrabold tracking-[-0.02em]">{site.logo}</span>
    </Link>
  );
}
