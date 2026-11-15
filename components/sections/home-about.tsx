import { ArrowLink } from "@/components/ui/arrow-link";
import { GalaxyScene } from "./galaxy-scene";
import type { HomeAbout as HomeAboutContent } from "@/lib/types/content";

export function HomeAbout({ about }: { about: HomeAboutContent }) {
  return (
    <section
      id="about"
      className="galaxy-about relative z-1 flex min-h-[82svh] w-full flex-none items-stretch overflow-clip px-6 py-16 text-white-token l:min-h-svh l:px-10 l:py-20"
    >
      <GalaxyScene />
      <div aria-hidden className="galaxy-hero-vignette absolute inset-0" />

      <div className="relative z-1 mx-auto flex w-full max-w-360 flex-col justify-between gap-20">
        <div className="flex w-full items-start justify-between gap-8">
          <div>
            <p className="galaxy-kicker">{about.title} / {about.aside}</p>
            <h2 className="mt-5 max-w-150 text-[clamp(2.75rem,7vw,8rem)] font-medium leading-[0.9] tracking-[-0.08em]">
              Software with a point of view.
            </h2>
          </div>
          <p className="hidden max-w-52 pt-1 text-right text-[14px] leading-5 text-white-a50 l:block">
            An independent engineer building products that keep their shape as they grow.
          </p>
        </div>

        <div className="flex w-full flex-col items-start justify-between gap-10 l:flex-row l:items-end">
          <p className="max-w-130 text-[18px] leading-7 tracking-[-0.02em] text-white-a85 l:text-[23px] l:leading-8">
            {about.statement}
          </p>
          <div className="flex flex-col items-start gap-5 l:items-end">
            <p className="galaxy-kicker">A closer look</p>
            <ArrowLink href={about.cta.href} variant="light">
              {about.cta.label}
            </ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
