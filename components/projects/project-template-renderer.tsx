import { ArrowLink } from "@/components/ui/arrow-link";
import { PostHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { Reveal } from "@/components/motion/reveal";
import { MediaAsset } from "@/components/ui/media-asset";
import { SectionTitle } from "@/components/ui/section-title";
import Image from "next/image";
import { technologyIcon } from "@/lib/tech-icons";
import type { Project } from "@/lib/types/content";

const text = (value: unknown) => (typeof value === "string" ? value : "");
const list = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

function Technology({ name }: { name: string }) {
  const icon = technologyIcon(name);
  return (
    <li className="flex items-center gap-3 border-b border-black-a10 py-3 text-[16px]">
      {icon ? (
        <span className="relative size-7 shrink-0">
          <Image
            src={icon}
            alt=""
            fill
            unoptimized
            sizes="28px"
            className="object-contain"
          />
        </span>
      ) : (
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full bg-black-a30"
        />
      )}
      <span>{name}</span>
    </li>
  );
}

function Repositories({ project }: { project: Project }) {
  const repositories =
    project.repositories ??
    (project.repoUrl
      ? [
          {
            url: project.repoUrl,
            name: project.title,
            owner: "GitHub",
            role: "primary",
          },
        ]
      : []);
  if (!repositories.length) return null;
  return (
    <section className="mt-16 border-t border-black-a10 pt-8">
      <SectionTitle title="Repositories" aside="Verified source links" />
      <div className="mt-8 grid gap-3 m:grid-cols-2">
        {repositories.map((repo) => (
          <a
            key={repo.url}
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-[6px] border border-black-a10 p-4 transition-colors hover:bg-neutral-50"
          >
            <span className="text-[11px] uppercase tracking-[0.12em] text-black-a50">
              {repo.role ?? "repository"}
            </span>
            <span className="mt-2 block text-[15px] font-medium">
              {repo.owner}/{repo.name}
            </span>
            <span className="mt-2 block text-[12px] text-black-a60">
              {[
                repo.language,
                repo.stars !== undefined ? `${repo.stars} stars` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function ProjectTemplateRenderer({ project }: { project: Project }) {
  const content = project.studioContent ?? {};
  const tech = content.techStack ?? {};
  const features = content.features ?? [];
  const architecture = content.architecture ?? [];
  const problem = text(content.caseStudy?.problem);
  const approach = text(content.caseStudy?.approach);
  const outcomes = Array.isArray(content.caseStudy?.results)
    ? content.caseStudy.results.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];
  const paragraphs = [
    text(content.brief?.overview),
    text(content.brief?.purpose),
    text(content.brief?.users),
  ].filter(Boolean);
  const template = project.template ?? "minimal-case-study";
  const editorial = template === "editorial-technical-story";
  const product = template === "product-showcase";
  const deepDive = template === "architecture-deep-dive";
  const openSource = template === "opensource-showcase";
  return (
    <>
      <PostHero
        title={project.title}
        category={project.category}
        excerpt={text(content.headline) || project.summary}
        date={project.year}
        media={project.hero}
      />
      <article
        className={`relative z-1 flex w-full flex-none flex-col items-center justify-center gap-20 bg-white-token px-6 py-20 m:pb-30 l:px-32.75 ${editorial ? "font-serif" : ""}`}
      >
        <Curtain className="bg-white-token" />
        <div className="relative h-px w-full max-w-360 bg-black-a16" />
        <div className="w-full max-w-360">
          {editorial && (
            <nav
              aria-label="On this page"
              className="mb-16 border-y border-black-a10 py-5"
            >
              <ol className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-black-a60">
                {["Brief", "Architecture", "Features", "Stack"].map(
                  (item, index) => (
                    <li key={item}>
                      <a
                        href={`#studio-${index}`}
                        className="hover:text-black-token"
                      >
                        0{index + 1} {item}
                      </a>
                    </li>
                  ),
                )}
              </ol>
            </nav>
          )}
          <Reveal>
            <section
              id="studio-0"
              className="grid gap-8 border-t border-black-a10 pt-8 l:grid-cols-[0.35fr_1fr]"
            >
              <p className="text-[12px] uppercase tracking-[0.14em] text-black-a50">
                01 ·{" "}
                {deepDive
                  ? "System brief"
                  : product
                    ? "Product brief"
                    : openSource
                      ? "Repository overview"
                      : "Project brief"}
              </p>
              <div className="max-w-190 space-y-6 text-[20px] leading-8">
                {paragraphs.length ? (
                  paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))
                ) : (
                  <p>{project.intro}</p>
                )}
                <div className="flex flex-wrap gap-4 pt-3">
                  {project.liveUrl && (
                    <ArrowLink href={project.liveUrl} variant="dark">
                      Visit live site
                    </ArrowLink>
                  )}
                  {project.repoUrl && (
                    <ArrowLink href={project.repoUrl} variant="dark">
                      View source
                    </ArrowLink>
                  )}
                </div>
              </div>
            </section>
          </Reveal>
          {features.length > 0 && (
            <section
              id="studio-2"
              className="mt-24 border-t border-black-a10 pt-8"
            >
              <SectionTitle
                title={product ? "Capabilities" : "What it does"}
                aside={`${features.length} evidenced features`}
              />
              <div className="mt-10 grid gap-px overflow-hidden rounded-[6px] bg-black-a10 m:grid-cols-2 l:grid-cols-3">
                {features.map((feature, index) => (
                  <article key={feature} className="bg-white-token p-6">
                    <span className="text-[12px] text-black-a50">
                      0{index + 1}
                    </span>
                    <h2 className="mt-8 text-[17px] font-medium">{feature}</h2>
                  </article>
                ))}
              </div>
            </section>
          )}
          {architecture.length > 0 && (
            <section
              id="studio-1"
              className="mt-24 border-t border-black-a10 pt-8"
            >
              <SectionTitle
                title={deepDive ? "Architecture deep dive" : "How it works"}
                aside="Evidence-backed structure"
              />
              <div className="mt-10 grid gap-4">
                {architecture.map((item, index) => (
                  <article
                    key={`${item.title}-${index}`}
                    className="grid gap-4 rounded-[6px] bg-neutral-50 p-6 l:grid-cols-[0.28fr_1fr]"
                  >
                    <h2 className="text-[17px] font-medium">{item.title}</h2>
                    <p className="max-w-180 text-[16px] leading-7 text-black-a70">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
          {(problem || approach) && (
            <section className="mt-24 grid gap-8 border-t border-black-a10 pt-8 l:grid-cols-2">
              {problem && (
                <article>
                  <SectionTitle
                    title="Challenge"
                    aside="Repository-grounded context"
                  />
                  <p className="mt-6 max-w-160 text-[17px] leading-7 text-black-a70">
                    {problem}
                  </p>
                </article>
              )}
              {approach && (
                <article>
                  <SectionTitle
                    title="Implementation"
                    aside="Engineering approach"
                  />
                  <p className="mt-6 max-w-160 text-[17px] leading-7 text-black-a70">
                    {approach}
                  </p>
                </article>
              )}
            </section>
          )}
          {outcomes.length > 0 && (
            <section className="mt-24 border-t border-black-a10 pt-8">
              <SectionTitle
                title="Verified outcomes"
                aside="Only supported results"
              />
              <ul className="mt-8 grid gap-3 m:grid-cols-2">
                {outcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="rounded-[6px] bg-neutral-50 p-5 text-[16px] leading-7"
                  >
                    {outcome}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section
            id="studio-3"
            className="mt-24 border-t border-black-a10 pt-8"
          >
            <SectionTitle
              title="Technology stack"
              aside="Detected from repository evidence"
            />
            <div className="mt-10 grid gap-8 m:grid-cols-2 l:grid-cols-3">
              {Object.entries(tech).map(([group, values]) => (
                <div key={group}>
                  <h2 className="text-[13px] uppercase tracking-[0.12em] text-black-a50">
                    {group}
                  </h2>
                  <ul className="mt-4">
                    {list(values).map((value) => (
                      <Technology key={value} name={value} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          {project.gallery.length > 0 && (
            <section className="mt-24 grid gap-3 m:grid-cols-2">
              {project.gallery.map((item) => (
                <div
                  key={item.url}
                  className="relative overflow-hidden rounded-[6px] bg-neutral-50 aspect-video"
                >
                  <MediaAsset
                    item={item}
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              ))}
            </section>
          )}
          <Repositories project={project} />
        </div>
      </article>
    </>
  );
}
