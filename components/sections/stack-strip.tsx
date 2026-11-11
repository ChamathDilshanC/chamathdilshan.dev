import { ScrollShift } from "@/components/motion/scroll-shift";
import { Ticker } from "@/components/motion/ticker";
import { SkillTile } from "@/components/ui/skill-tile";
import type { Skill } from "@/lib/types/content";

/** Endless strip of technology wordmarks that also drifts with the page scroll. */
export function StackStrip({ skills }: { skills: Skill[] }) {
  const featured = skills.filter((skill) => skill.featured);
  if (featured.length === 0) return null;
  return (
    <div className="relative z-1 w-full flex-none overflow-hidden bg-white-token">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage:
            "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 100% 80% at 50% 50%, #000 50%, transparent 90%)",
          WebkitMaskImage:
            "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 100% 80% at 50% 50%, #000 50%, transparent 90%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <section
        aria-label="Technologies"
        className="relative z-1 flex w-full items-center justify-end gap-2.5 overflow-clip bg-transparent py-20"
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
