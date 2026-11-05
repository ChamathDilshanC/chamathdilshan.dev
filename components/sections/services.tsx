import { Curtain } from "@/components/motion/curtain";
import { LineReveal } from "@/components/motion/line-reveal";
import { Reveal } from "@/components/motion/reveal";
import { ScrollScale } from "@/components/motion/scroll-scale";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Media } from "@/components/ui/media";
import { SectionTitle } from "@/components/ui/section-title";
import type { HomeServices, ServiceItem } from "@/lib/types/content";
import { STATEMENT } from "@/lib/typography";

function ServiceRow({ service }: { service: ServiceItem }) {
  return (
    <div className="flex w-full flex-col items-center justify-start gap-6 overflow-clip bg-neutral-900">
      <div className="flex w-full flex-col items-start justify-start gap-5 l:flex-row l:justify-between l:gap-0">
        <div className="flex w-full items-center justify-center l:w-px l:max-w-75 l:flex-1">
          <p className="w-full font-geist text-[36px] leading-[36px] font-medium tracking-[-2.1px] text-white-token m:text-[70px] m:leading-[70px] m:tracking-[-3px] l:text-[195px] l:leading-[196px] l:tracking-[-7.8px]">
            {service.number}
          </p>
        </div>
        <div className="flex w-full flex-col items-start justify-center gap-10 l:w-px l:max-w-237 l:flex-1 l:flex-row l:gap-16.5">
          <ScrollScale className="h-71.25 w-full flex-none rounded-[5px] l:w-101.5">
            <Media src={service.image} sizes="(min-width: 1200px) 406px, 100vw" />
          </ScrollScale>
          <div className="flex w-full flex-col items-start justify-center gap-7.5 l:w-px l:flex-1 l:gap-29 l:py-2.75">
            <h3 className="w-full type-heading-4 text-white-token">{service.title}</h3>
            <div className="flex w-full flex-col items-start justify-center gap-2.5">
              <p className="w-full type-body-1 text-white-token">{service.heading}</p>
              <p className="w-full type-body-1 text-white-a50">{service.body}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px w-full bg-white-a10" />
    </div>
  );
}

export function Services({ services }: { services: HomeServices }) {
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-neutral-900 px-6 pt-6 pb-20 m:gap-20 m:pb-30 l:gap-25 l:pb-40">
      <Curtain className="bg-neutral-900" />

      <div className="relative flex w-full max-w-360 flex-none flex-col items-center justify-center gap-25.25 m:gap-30 l:gap-57.75">
        <SectionTitle title={services.title} aside={services.aside} tone="light" />
        <div className="relative flex w-full flex-col items-start justify-center gap-10 m:gap-17.5">
          <LineReveal
            text={services.statement}
            dimSecondHalf
            className={`${STATEMENT} text-white-token [--indent:26%] m:[--indent:17%] l:[--indent:15%]`}
          />
          <div className="relative flex w-full items-center justify-start overflow-clip">
            <ArrowLink href={services.cta.href} variant="light">
              {services.cta.label}
            </ArrowLink>
          </div>
          <div className="absolute -top-17.25 left-0 z-1 aspect-[0.7672/1] w-17.75 overflow-hidden rounded-[5px] m:-top-23.75 m:w-23.5 l:-top-43.75 l:aspect-auto l:h-58 l:w-44.5">
            <Media src={services.poster} alt={services.posterAlt} sizes="178px" />
          </div>
        </div>
      </div>

      <div className="relative flex w-full max-w-360 flex-none flex-col items-center justify-center gap-17.5 overflow-clip l:pl-23.5">
        {services.items.map((service, i) => (
          <Reveal key={`${i}-${service.number}`} className="relative z-3 w-full">
            <ServiceRow service={service} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
