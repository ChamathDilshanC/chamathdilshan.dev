import { Curtain } from "@/components/motion/curtain";
import { LineReveal } from "@/components/motion/line-reveal";
import { SectionTitle } from "@/components/ui/section-title";
import type { HomeAbout as HomeAboutContent } from "@/lib/types/content";
import { STATEMENT } from "@/lib/typography";

export function HomeAbout({ about }: { about: HomeAboutContent }) {
  return (
    <section
      id="about"
      className="relative z-1 flex w-full flex-none flex-col items-center justify-start bg-white-token px-6 pt-6 pb-2"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-1"
        style={{
          backgroundImage: "linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage:
            "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
          WebkitMaskImage:
            "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <Curtain className="bg-white-token" />

      <div className="relative z-2 flex w-full max-w-360 flex-none flex-col items-center justify-center gap-15 m:gap-20">
        <SectionTitle title={about.title} aside={about.aside} />
        <LineReveal text={about.statement} className={`${STATEMENT} text-black-token [--indent:22%] l:[--indent:37.5%]`} />
      </div>

      <div className="h-20 w-full flex-none l:h-28" />
    </section>
  );
}
