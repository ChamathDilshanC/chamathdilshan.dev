"use client";

import Image from "next/image";
import Link from "next/link";
import { enter } from "@/lib/enter";
import { useSiteContent } from "./site-content";

/** Header logo: the CXD brand mark rendered from the SpaceX-style artwork. */
export function Logo() {
  const { site } = useSiteContent();
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className="animate-enter relative h-4.5 w-25 flex-none overflow-hidden"
      style={enter(0.6, { y: "20%" })}
    >
      <Image
        src="/Logo.png"
        alt={site.logo}
        fill
        priority
        sizes="100px"
        className="object-cover brightness-0 invert"
      />
    </Link>
  );
}
