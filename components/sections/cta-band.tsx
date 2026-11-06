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
        <div className="relative flex aspect-[3/2] h-auto w-full flex-col items-center justify-center overflow-clip rounded-[5px] bg-black-token m:aspect-auto m:h-220">
          <Parallax speed={90} overscan={20} className="absolute inset-0 opacity-80">
            <Media
              src={cta.background}
              alt={cta.backgroundAlt}
              sizes="calc(100vw - 48px)"
              className="[@media(width<810px)]:object-fill"
            />
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
            <div className="absolute top-1/2 left-1/2 z-1 aspect-[640/930] h-auto w-[30vw] max-w-56 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[5px] m:top-[calc(50.12%-162px)] m:left-[calc(50%-112px)] m:h-81 m:w-56 m:translate-x-0 m:translate-y-0">
              <Media src={cta.portrait} alt={cta.portraitAlt} sizes="224px" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
