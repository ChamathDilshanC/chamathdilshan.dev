"use client";

import { motion } from "motion/react";
import { SiteHeader } from "@/components/layout/site-header";
import { StickyHero } from "@/components/layout/sticky-hero";
import { Wordmark } from "@/components/layout/wordmark";
import { LiquidImage } from "@/components/motion/liquid-image";
import { usePageParallax } from "@/components/motion/parallax";
import { ArrowLink } from "@/components/ui/arrow-link";
import { HeroPhoto } from "@/components/ui/hero-photo";
import { Media } from "@/components/ui/media";
import { useSiteContent } from "@/components/layout/site-content";
import { enter } from "@/lib/enter";

export function HomeHero() {
  const { site, "home.hero": hero } = useSiteContent();
  const bottomY = usePageParallax(107);

  return (
    <StickyHero className="justify-between">
      {/* The liquid effect is the hover here, so no zoom. */}
      <HeroPhoto fill={hero.image} scrollZoom>
        <Media src={hero.image} alt={hero.imageAlt} sizes="100vw" preload />
        <LiquidImage src={hero.image} className="hidden l:block" />
      </HeroPhoto>

      <SiteHeader active="home" />

      <div className="h-17.5 w-full flex-none" />

      <div className="relative z-1 flex w-full max-w-360 flex-none flex-col items-start justify-center gap-10 px-6 l:absolute l:top-48.25 l:left-6 l:w-min l:px-0">
        <div className="relative flex w-full flex-none flex-col items-start justify-center l:w-auto l:self-stretch">
          <p className="animate-enter w-full max-w-75 type-body-1" style={enter(0.8)}>
            {hero.intro.line1}
          </p>
          <p className="animate-enter w-full max-w-75 type-body-1" style={enter(0.9)}>
            {hero.intro.line2}
            <span className="text-white-a50">{hero.intro.line2Dim}</span>
          </p>
          <p className="animate-enter w-full max-w-75 type-body-1 text-white-a50" style={enter(1)}>
            {hero.intro.line3Dim}
          </p>
        </div>
        <div className="animate-enter relative flex-none" style={enter(1.1)}>
          <ArrowLink href={hero.cta.href} variant="light">
            {hero.cta.label}
          </ArrowLink>
        </div>
      </div>

      <motion.div
        className="relative flex w-full max-w-360 flex-none flex-col items-start justify-center gap-14 px-6 m:gap-6.5 l:px-0"
        style={{ y: bottomY }}
      >
        <div className="relative flex w-min flex-none flex-col items-start justify-center gap-1.5 pt-7.5 l:pl-60">
          {hero.disciplines.map((item, i) => (
            <p key={`${i}-${item}`} className="animate-enter whitespace-pre type-body-1" style={enter(0.9 + i * 0.1)}>
              {i === 0 && <span className="text-white-a50">01/ </span>}
              {item}
            </p>
          ))}
        </div>
        <div className="relative flex w-full flex-none flex-col items-start justify-start gap-7.5 m:flex-row m:content-end m:items-end m:justify-between m:gap-0">
          <div className="animate-enter relative order-1 flex flex-none items-end m:order-0 m:w-min" style={enter(1.2)}>
            <p className="whitespace-pre type-body-1">{site.year}</p>
          </div>
          <h1 className="relative order-0 w-full flex-none text-white-token m:order-0 m:w-3/5 l:w-3/4">
            <Wordmark />
          </h1>
        </div>
      </motion.div>
    </StickyHero>
  );
}
