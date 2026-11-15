"use client";

import { motion } from "motion/react";
import { SiteHeader } from "@/components/layout/site-header";
import { StickyHero } from "@/components/layout/sticky-hero";
import { usePageParallax } from "@/components/motion/parallax";
import { ArrowLink } from "@/components/ui/arrow-link";
import { useSiteContent } from "@/components/layout/site-content";
import { enter } from "@/lib/enter";
import { GalaxyScene } from "./galaxy-scene";

export function HomeHero() {
  const { site, "home.hero": hero } = useSiteContent();
  const bottomY = usePageParallax(107);

  return (
    <StickyHero className="galaxy-hero justify-between bg-[#05080c] text-white-token">
      <GalaxyScene />
      <div aria-hidden className="galaxy-hero-vignette absolute inset-0" />
      <SiteHeader active="home" />

      <div className="relative z-1 flex w-full max-w-360 flex-1 flex-col justify-between px-6 pb-8 pt-32 l:px-10 l:pb-10 l:pt-36">
        <div className="flex w-full items-start justify-between gap-8">
          <div className="max-w-94">
            <p className="animate-enter galaxy-kicker" style={enter(0.8)}>
              Independent software engineer · 2021—{site.year}
            </p>
            <h1 className="animate-enter mt-4 max-w-92 text-[clamp(2.5rem,6vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.07em]" style={enter(0.92)}>
              Building ideas with a little more gravity.
            </h1>
            <p className="animate-enter mt-6 max-w-76 text-[15px] leading-6 text-white-a50 l:text-[17px]" style={enter(1.06)}>
              {hero.intro.line1} {hero.intro.line2}{hero.intro.line2Dim} {hero.intro.line3Dim}
            </p>
            <div className="animate-enter mt-8" style={enter(1.16)}>
              <ArrowLink href={hero.cta.href} variant="light">
                {hero.cta.label}
              </ArrowLink>
            </div>
          </div>
          <div className="hidden max-w-48 pt-1 text-right l:block">
            <p className="galaxy-kicker">Selected orbit</p>
            <p className="mt-3 text-[15px] leading-5 text-white-a50">Frontend · Backend · Cloud</p>
          </div>
        </div>

        <motion.div className="flex w-full items-end justify-between gap-8" style={{ y: bottomY }}>
          <div className="flex items-end gap-3">
            <span className="size-2 rounded-full bg-[#d9ecff] shadow-[0_0_18px_#b8ddff]" />
            <p className="text-[13px] tracking-[0.08em] text-white-a50">LIVE / IN MOTION</p>
          </div>
          <p className="text-[13px] tracking-[0.08em] text-white-a50">{site.year}</p>
        </motion.div>
      </div>
    </StickyHero>
  );
}
