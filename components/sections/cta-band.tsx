import { Parallax } from "@/components/motion/parallax";
import { Ticker } from "@/components/motion/ticker";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Media } from "@/components/ui/media";
import type { HomeCta } from "@/lib/types/content";

/** Dark rounded band with a parallax backdrop, a scrolling line and a centred portrait. */
export function CtaBand({ cta }: { cta: HomeCta }) {
  return (
    <div className="relative z-1 w-full flex-none">
      <section className="flex w-full flex-col items-center justify-start bg-white-token p-6">
        <div className="relative flex h-200 w-full flex-col items-center justify-center overflow-clip rounded-[5px] bg-black-token">
          <Parallax speed={90} overscan={20} className="absolute inset-0 opacity-80">
            <Media src={cta.background} alt={cta.backgroundAlt} sizes="calc(100vw - 48px)" />
          </Parallax>

          <div className="relative flex w-full flex-col items-center justify-center gap-30 overflow-clip pt-32.5">
            <div className="flex min-h-38 w-full items-center justify-center opacity-0 m:opacity-100">
              <div className="h-25 w-px max-w-140 flex-1 l:max-w-200">
                <Ticker speed={50} gap={10} fade={10}>
                  <h2 className="whitespace-pre type-heading-2 mix-blend-difference">{cta.marquee} —</h2>
                </Ticker>
              </div>
            </div>
            <ArrowLink href={cta.action.href} variant="light">
              {cta.action.label}
            </ArrowLink>
            <div className="absolute top-[calc(50.12%-162px)] left-[calc(50%-112px)] z-1 h-81 w-56 overflow-hidden rounded-[5px]">
              <Media src={cta.portrait} alt={cta.portraitAlt} sizes="224px" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
