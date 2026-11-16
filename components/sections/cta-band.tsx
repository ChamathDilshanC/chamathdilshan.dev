"use client";

import { Parallax } from "@/components/motion/parallax";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Media } from "@/components/ui/media";
import { useImageAspectRatio } from "@/hooks/use-image-aspect-ratio";
import type { HomeCta } from "@/lib/types/content";
import Image from "next/image";
import type { CSSProperties } from "react";

/** Dark rounded band with a parallax backdrop, brand mark and a contact action. */
export function CtaBand({ cta }: { cta: HomeCta }) {
  const backgroundRatio = useImageAspectRatio(cta.background, 3 / 2);

  return (
    <div className="relative z-1 w-full flex-none">
      <section className="flex w-full flex-col items-center justify-start bg-white-token p-6">
        <div
          className="relative flex aspect-[var(--background-aspect)] h-auto w-full flex-col items-center justify-center overflow-clip rounded-[5px] bg-black-token m:aspect-auto m:h-220"
          style={{ "--background-aspect": backgroundRatio } as CSSProperties}
        >
          <Parallax speed={90} overscan={20} className="absolute inset-0 opacity-80">
            <Media
              src={cta.background}
              alt={cta.backgroundAlt}
              sizes="calc(100vw - 48px)"
              className="[@media(width<810px)]:object-fill"
            />
          </Parallax>

          <div className="relative flex w-full flex-col items-center justify-center gap-30 overflow-clip pt-32.5">
            <div className="flex min-h-38 w-full items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative h-12 w-40 m:h-15 m:w-48">
                  <Image src="/brand-logo.png" alt="Chamath logo" fill sizes="192px" className="object-contain" />
                </div>
                <p className="max-w-72 text-[11px] font-semibold uppercase tracking-[0.16em] text-white-a75 m:max-w-none m:text-[13px]">
                  {cta.marquee}
                </p>
              </div>
            </div>
            <ArrowLink href={cta.action.href} variant="light">
              {cta.action.label}
            </ArrowLink>
          </div>
        </div>
      </section>
    </div>
  );
}
