import { ScrollShift } from "@/components/motion/scroll-shift";
import { Ticker } from "@/components/motion/ticker";
import { SkillTile } from "@/components/ui/skill-tile";
import type { Skill } from "@/lib/types/content";

/** Endless strip of technology wordmarks that also drifts with the page scroll. */
export function StackStrip({ skills }: { skills: Skill[] }) {
  const featured = skills.filter((skill) => skill.featured);
  if (featured.length === 0) return null;
  return (
    <div className="relative z-1 w-full flex-none bg-white-token">
      <section
        aria-label="Technologies"
        className="flex w-full items-center justify-end gap-2.5 overflow-clip bg-white-token py-20"
      >
        <ScrollShift className="relative h-42.5 w-[400%] flex-none">
          <Ticker speed={50} gap={10} hoverFactor={0.5}>
            {featured.map((skill, i) => (
              <SkillTile key={`${i}-${skill.name}`} skill={skill} className="h-42 w-56" />
            ))}
          </Ticker>
        </ScrollShift>
      </section>
    </div>
  );
}
