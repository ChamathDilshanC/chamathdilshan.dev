import { ScrollShift } from "@/components/motion/scroll-shift";
import { Ticker } from "@/components/motion/ticker";
import { SkillTile } from "@/components/ui/skill-tile";
import type { Skill } from "@/lib/types/content";

/** Endless strip of technology wordmarks that also drifts with the page scroll. */
export function StackStrip({ skills }: { skills: Skill[] }) {
  const featured = skills.filter((skill) => skill.featured);
  if (featured.length === 0) return null;
  return (
    <section aria-label="Technologies" className="galaxy-stack relative z-1 w-full flex-none overflow-hidden py-16 l:py-24">
      <div aria-hidden className="galaxy-stack-grid absolute inset-0" />
      <div className="relative z-1 mx-auto flex w-full max-w-360 flex-col gap-10 px-6 l:px-10">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="galaxy-kicker">The toolkit</p>
            <h2 className="mt-3 max-w-100 text-[clamp(2rem,4vw,4.75rem)] font-medium leading-[0.95] tracking-[-0.06em] text-white-token">
              A stack that keeps moving.
            </h2>
          </div>
          <p className="hidden max-w-56 text-right text-[14px] leading-5 text-white-a50 l:block">
            A focused set of tools for shipping clear, resilient digital products.
          </p>
        </div>
        <div className="relative -mx-6 flex flex-col gap-3 l:-mx-10">
          <ScrollShift className="h-28 w-[180%] flex-none l:h-32 l:w-[140%]" from={280}>
            <Ticker speed={32} gap={12} hoverFactor={0.45} fade={8}>
              {featured.map((skill, i) => (
                <SkillTile key={`a-${i}-${skill.name}`} skill={skill} variant="galaxy" className="h-24 w-40 l:h-28 l:w-48" />
              ))}
            </Ticker>
          </ScrollShift>
          <ScrollShift className="h-28 w-[180%] flex-none self-end l:h-32 l:w-[140%]" from={-220}>
            <Ticker speed={24} gap={12} hoverFactor={0.45} fade={8}>
              {[...featured].reverse().map((skill, i) => (
                <SkillTile key={`b-${i}-${skill.name}`} skill={skill} variant="galaxy" className="h-24 w-40 l:h-28 l:w-48" />
              ))}
            </Ticker>
          </ScrollShift>
        </div>
      </div>
    </section>
  );
}
