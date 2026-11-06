import type { Metadata } from "next";
import { AboutHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { LineReveal } from "@/components/motion/line-reveal";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { ScrollShift } from "@/components/motion/scroll-shift";
import { Ticker } from "@/components/motion/ticker";
import { ExperienceTimeline } from "@/components/sections/experience";
import { Journal } from "@/components/sections/journal";
import { Numbers } from "@/components/sections/numbers";
import { Media } from "@/components/ui/media";
import { PlusList } from "@/components/ui/plus-list";
import { SectionTitle } from "@/components/ui/section-title";
import { SkillTile } from "@/components/ui/skill-tile";
import { getExperience, getPosts, getSiteContent, getSkills } from "@/lib/content";
import type { AboutProcess, AboutRecognition, AboutStack, AboutToolbox, Skill } from "@/lib/types/content";
import { STATEMENT } from "@/lib/typography";

export const metadata: Metadata = {
  title: "About",
  description: "Who I am, where I have worked, how I work and the tools I use.",
  alternates: { canonical: "/about" },
};

/** `curtain`: slide over the sticky hero (only when this is the first section after it). */
function Process({ process, curtain = true }: { process: AboutProcess; curtain?: boolean }) {
  return (
    <section
      id="about"
      className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-12.5 bg-white-token px-6 py-20 m:pb-25"
    >
      {curtain && <Curtain className="bg-white-token" />}
      <div className="relative flex w-full max-w-360 flex-col items-center justify-center gap-15 m:gap-20">
        <SectionTitle title={process.title} aside={process.aside} />
        <LineReveal text={process.statement} className={`${STATEMENT} text-black-token [--indent:22%] l:[--indent:37.5%]`} />
      </div>
      <div className="relative flex w-full max-w-360 flex-col items-start justify-start gap-10 m:gap-12.5">
        <Reveal duration={0.6} className="w-full">
          <Parallax className="relative aspect-[2400/1100] w-full rounded-[5px] m:aspect-auto m:h-svh l:h-[80vh]">
            <Media src={process.image} alt={process.imageAlt} sizes="100vw" />
          </Parallax>
        </Reveal>
        <div className="flex w-full flex-col items-center justify-center gap-10">
          {process.steps.map((step, i) => (
            <Reveal key={`${i}-${step.number}`} className="w-full">
              <div className="flex w-full flex-col items-center justify-center gap-10">
                <div className="h-px w-full bg-black-a16" />
                <div className="flex w-full flex-col items-start gap-6 l:flex-row l:gap-0">
                  <p className="w-full type-body-1 text-black-token l:w-51.75 l:flex-none">{step.number}</p>
                  <div className="flex w-full flex-col items-start justify-between gap-8 m:flex-row l:flex-1">
                    <h2 className="type-heading-4 text-black-token m:w-97.5 m:flex-none">{step.title}</h2>
                    <div className="flex w-full flex-col items-start justify-center gap-10 m:max-w-145 l:pr-44.5">
                      <p className="w-full type-body-1 text-black-a60">{step.body}</p>
                      <PlusList heading="What’s included" items={step.included} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Toolbox({ toolbox }: { toolbox: AboutToolbox }) {
  if (toolbox.items.length === 0) return null;
  return (
    <div className="relative z-1 w-full flex-none">
      <section className="flex w-full flex-col items-center justify-start gap-15 overflow-hidden bg-neutral-900 pb-25">
        <div className="flex w-full max-w-360 flex-col items-center px-6 pt-6">
          <SectionTitle title={toolbox.title} aside={toolbox.aside} tone="light" />
        </div>
        <Reveal className="flex h-130.25 w-full justify-center overflow-hidden">
          <ScrollShift className="h-full w-[400%] flex-none">
            <Ticker speed={40} gap={10} hoverFactor={0.4}>
              {toolbox.items.map((item, i) => (
                <div key={`${i}-${item.name}`} className="flex h-126.25 w-85.25 flex-col items-center justify-center gap-2.5">
                  <div className="relative w-full flex-1 overflow-hidden rounded-[5px]">
                    <Media src={item.image} sizes="341px" />
                  </div>
                  <div className="flex w-full flex-col px-2.5">
                    <p className="type-body-3">{item.name}</p>
                    <p className="type-body-3 text-white-a50">{item.role}</p>
                  </div>
                </div>
              ))}
            </Ticker>
          </ScrollShift>
        </Reveal>
      </section>
    </div>
  );
}

function Recognition({ recognition }: { recognition: AboutRecognition }) {
  if (recognition.rows.length === 0) return null;
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-6 pb-20 m:gap-20 m:pb-22.5">
      <div className="w-full max-w-360">
        <SectionTitle title={recognition.title} aside={recognition.aside} />
      </div>
      <div className="flex w-full max-w-360 flex-col items-center justify-center gap-5">
        {recognition.rows.map((row, i) => (
          <Reveal key={`${row.award}-${i}`} duration={0.8} delay={0.05 * i} className="w-full">
            <div className="flex w-full flex-col gap-5">
              <div className="h-px w-full bg-black-a10" />
              <div className="grid w-full grid-cols-2 gap-x-6 gap-y-2 l:grid-cols-[2fr_3fr_3fr_1fr]">
                <p className="type-body-1 text-black-token">{row.count}</p>
                <p className="text-right type-body-1 text-black-token l:text-left">{row.award}</p>
                <p className="type-body-1 text-black-token">{row.project}</p>
                <p className="text-right type-body-1 text-black-a60">{row.result}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/**
 * Lays skills into the 6-column grid with the design's empty cells: every
 * 12 cells, positions 0, 2, 7 and 10 stay blank on desktop.
 */
const GAPS = new Set([0, 2, 7, 10]);
function withGaps(skills: Skill[]): Array<Skill | null> {
  const cells: Array<Skill | null> = [];
  let next = 0;
  while (next < skills.length) {
    if (GAPS.has(cells.length % 12)) cells.push(null);
    else cells.push(skills[next++] ?? null);
  }
  return cells;
}

function StackGrid({ stack, skills }: { stack: AboutStack; skills: Skill[] }) {
  const visible = skills.filter((skill) => skill.visible);
  if (visible.length === 0) return null;
  return (
    <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-6 pb-20 m:gap-20 m:pb-30">
      <div className="w-full max-w-360">
        <SectionTitle title={stack.title} aside={stack.aside} />
      </div>
      <div className="grid w-full max-w-360 grid-cols-2 gap-2.5 m:grid-cols-3 l:grid-cols-6">
        {withGaps(visible).map((skill, i) =>
          skill ? (
            <Reveal key={`${i}-${skill.name}`} duration={0.8} delay={0.04 * i}>
              <SkillTile skill={skill} className="h-42 w-full" />
            </Reveal>
          ) : (
            <div key={`empty-${i}`} aria-hidden className="hidden l:block" />
          ),
        )}
      </div>
    </section>
  );
}

export default async function AboutPage() {
  const [content, skills, posts, experience] = await Promise.all([
    getSiteContent(),
    getSkills(),
    getPosts(),
    getExperience(),
  ]);
  const about = content["page.about"];
  const hasExperience = experience.some((company) => company.roles.length > 0);
  return (
    <>
      <AboutHero title={about.title} label={about.label} blurb={about.blurb} image={about.image} imageAlt={about.imageAlt} />
      <ExperienceTimeline heading={content["about.experience"]} experience={experience} curtain />
      <Process process={content["about.process"]} curtain={!hasExperience} />
      <Toolbox toolbox={content["about.toolbox"]} />
      <Recognition recognition={content["about.recognition"]} />
      <StackGrid stack={content["about.stack"]} skills={skills} />
      <Numbers numbers={content["home.numbers"]} />
      <Journal journal={content["home.journal"]} posts={posts} />
    </>
  );
}
