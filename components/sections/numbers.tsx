import { Reveal } from "@/components/motion/reveal";
import { SectionTitle } from "@/components/ui/section-title";
import type { HomeNumbers, NumberItem } from "@/lib/types/content";

type Stat = NumberItem;

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="flex w-full flex-col items-start justify-center gap-2.5 overflow-clip">
      <div className="flex w-full items-start justify-center gap-2.5">
        <h3 className="w-px flex-1 type-heading-2 text-black-token">{stat.value}</h3>
        <div aria-hidden className="bordered relative h-2 w-2 flex-none after:border-t after:border-r after:border-black-token" />
      </div>
      <div className="flex w-full flex-col items-start justify-center gap-3.5">
        <div className="h-px w-full bg-black-a10" />
        <div className="flex w-full flex-col items-start justify-center gap-2.5">
          <p className="w-full type-body-1 text-black-token">{stat.title}</p>
          <p className="w-full max-w-75.5 type-body-3 text-black-a60">{stat.body}</p>
        </div>
      </div>
    </div>
  );
}

/** Four headline figures in a two-column grid. */
export function Numbers({ numbers }: { numbers: HomeNumbers }) {
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-6 pb-20 m:gap-20 m:pb-30 l:gap-27.5">
      <div className="w-full max-w-360">
        <SectionTitle title={numbers.title} aside={numbers.aside} />
      </div>
      <div className="flex w-full max-w-360 flex-col items-center justify-center gap-7.5 overflow-clip">
        <div className="h-px w-full bg-black-a10" />
        <div className="flex w-full flex-col items-center justify-start gap-10 m:grid m:grid-cols-2 m:items-stretch m:gap-27.5">
          {numbers.items.map((stat, i) => (
            <Reveal
              key={`${i}-${stat.title}`}
              duration={i % 2 ? 1 : 0.8}
              delay={i % 2 ? 0.1 : 0}
              className="w-full justify-self-start m:self-start"
            >
              <StatCard stat={stat} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
