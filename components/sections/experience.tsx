import { Curtain } from "@/components/motion/curtain";
import { DrawLine } from "@/components/motion/draw-line";
import { Reveal } from "@/components/motion/reveal";
import { CompanyLogo } from "@/components/ui/company-logo";
import { PlusList } from "@/components/ui/plus-list";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/cn";
import { formatDuration, monthsBetween, roleRange, tenure, thisMonth, yearRange } from "@/lib/experience";
import type { AboutExperience, Experience, ExperienceRole } from "@/lib/types/content";

function host(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Every role at one company, newest first, joined by a line so a promotion
 * reads as one path. The current role has a filled dot.
 */
function Roles({ roles, now }: { roles: ExperienceRole[]; now: string }) {
  return (
    <ol className="flex w-full flex-col gap-10 m:max-w-145 l:pr-44.5">
      {roles.map((role, i) => (
        <li key={`${i}-${role.title}-${role.start}`} className="relative flex w-full flex-col gap-5 pl-7">
          <span
            aria-hidden
            className={cn(
              "absolute top-1.25 left-0 size-3 rounded-full",
              role.end ? "bg-white-token ring-1 ring-black-a60 ring-inset" : "bg-black-token",
            )}
          />
          {i < roles.length - 1 && <DrawLine delay={0.2} className="absolute top-5.75 -bottom-9.75 left-[5.5px] w-px" lineClassName="bg-black-a16" />}
          <div className="flex w-full flex-col gap-1">
            <h3 className="type-body-1 text-black-token">{role.title}</h3>
            <p className="type-body-3 text-black-a60">
              {[role.employmentType, roleRange(role), formatDuration(monthsBetween(role.start, role.end, now))].join(" · ")}
            </p>
          </div>
          {role.summary && <p className="w-full type-body-1 whitespace-pre-line text-black-a60">{role.summary}</p>}
          {role.highlights.length > 0 && <PlusList items={role.highlights} />}
          {role.skills.length > 0 && (
            <ul aria-label="Skills" className="flex flex-wrap gap-1.5">
              {role.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full px-2.5 py-1 font-geist text-[13px] leading-4.5 font-medium tracking-[-0.2px] text-black-a60 ring-1 ring-black-a10 ring-inset"
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

function Company({ company, now }: { company: Experience; now: string }) {
  const span = tenure(company);
  return (
    <Reveal className="w-full">
      <div className="flex w-full flex-col items-center justify-center gap-10">
        <div className="h-px w-full bg-black-a16" />
        <div className="flex w-full flex-col items-start gap-6 l:flex-row l:gap-0">
          <div className="flex w-full flex-col gap-1 l:sticky l:top-10 l:w-51.75 l:flex-none">
            <p className="type-body-1 text-black-token">{yearRange(span)}</p>
            <p className="type-body-3 text-black-a60">{formatDuration(monthsBetween(span.start, span.end, now))}</p>
          </div>
          <div className="flex w-full flex-col items-start justify-between gap-8 m:flex-row l:flex-1">
            <div className="flex w-full flex-col items-start gap-5 m:sticky m:top-10 m:w-97.5 m:flex-none">
              <h2 className="type-heading-4 text-black-token">{company.company}</h2>
              {(company.logo || company.location || company.companyUrl) && (
                <div className="flex items-center gap-3">
                  {company.logo && <CompanyLogo src={company.logo} />}
                  <div className="flex flex-col gap-0.5">
                    {company.location && <p className="type-body-3 text-black-a60">{company.location}</p>}
                    {company.companyUrl && (
                      <a
                        href={company.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit type-body-3 text-black-token underline decoration-black-a16 underline-offset-4 transition-colors hover:decoration-black-token"
                      >
                        {host(company.companyUrl)} ↗
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Roles roles={company.roles} now={now} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

type Props = {
  heading: AboutExperience;
  experience: Experience[];
  /** Slide over the sticky hero, when this is the first section after it. */
  curtain?: boolean;
};

/**
 * Work history: one row per company, its roles joined like a LinkedIn promotion
 * path. On wider screens the company stays in view while its roles scroll by.
 */
export function ExperienceTimeline({ heading, experience, curtain = false }: Props) {
  const companies = experience.filter((company) => company.roles.length > 0);
  if (companies.length === 0) return null;
  const now = thisMonth();
  return (
    <section
      id="experience"
      className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 py-20 m:gap-20 m:pb-25"
    >
      {curtain && <Curtain className="bg-white-token" />}
      <div className="relative w-full max-w-360">
        <SectionTitle title={heading.title} aside={heading.aside} />
      </div>
      <div className="relative flex w-full max-w-360 flex-col items-center justify-center gap-10">
        {companies.map((company, i) => (
          <Company key={`${i}-${company.company}`} company={company} now={now} />
        ))}
      </div>
    </section>
  );
}
