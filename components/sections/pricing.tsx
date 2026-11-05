import { Curtain } from "@/components/motion/curtain";
import { Reveal } from "@/components/motion/reveal";
import { ArrowLink } from "@/components/ui/arrow-link";
import { PlusList } from "@/components/ui/plus-list";
import { SectionTitle } from "@/components/ui/section-title";
import type { HomePricing, PricingPlan } from "@/lib/types/content";
import { cn } from "@/lib/cn";

function PricingCard({ plan, pricing }: { plan: PricingPlan; pricing: HomePricing }) {
  const dark = plan.tone === "dark";
  const ink = dark ? "text-white-token" : "text-black-token";
  return (
    <div
      className={cn(
        "flex h-min w-full flex-col items-start justify-center gap-10 overflow-clip rounded-[5px] p-7.5",
        dark ? "bg-neutral-900" : "bg-neutral-50",
      )}
    >
      <div className="flex w-full flex-col items-start justify-center gap-2.5">
        <p className={cn("w-full type-body-1", ink)}>{plan.name}</p>
        <p className={cn("w-full max-w-[207.5px] type-body-3", dark ? "text-white-a50" : "text-black-a60")}>
          {plan.description}
        </p>
      </div>
      <div className="flex w-full flex-wrap content-end items-end justify-start gap-1">
        <div className="flex w-min items-start justify-center gap-1">
          <p className={cn("type-body-1", ink)}>$</p>
          <h3 className={cn("whitespace-pre type-heading-4", ink)}>{plan.price}</h3>
        </div>
        <p className={cn("pb-1.25 whitespace-pre type-body-1", ink)}>{plan.unit}</p>
      </div>
      <ArrowLink href={pricing.cta.href} variant={dark ? "light" : "dark"}>
        {pricing.cta.label}
      </ArrowLink>
      <PlusList heading={pricing.includedHeading} items={plan.included} tone={dark ? "light" : "dark"} />
    </div>
  );
}

const entrances = [
  { duration: 0.8, delay: 0, y: 0 },
  { duration: 1, delay: 0.2, y: 20 },
  { duration: 1.2, delay: 0.4, y: 40 },
];

export function Pricing({ pricing }: { pricing: HomePricing }) {
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-6 pb-20 m:gap-20 m:pb-30 l:gap-15">
      <Curtain className="bg-white-token" />
      <div className="relative w-full max-w-360">
        <SectionTitle title={pricing.title} aside={pricing.aside} />
      </div>
      <div className="relative flex w-full max-w-360 flex-col items-start justify-center gap-2.5 l:flex-row">
        {pricing.plans.map((plan, i) => (
          <Reveal key={`${i}-${plan.name}`} className="w-full l:w-px l:flex-1" {...(entrances[i] ?? entrances[0])}>
            <PricingCard plan={plan} pricing={pricing} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
