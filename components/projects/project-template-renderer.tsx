import Image from "next/image";
import type { ReactNode } from "react";
import { IconCode } from "@tabler/icons-react";
import { ArrowLink } from "@/components/ui/arrow-link";
import { PostHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { Reveal } from "@/components/motion/reveal";
import { MediaAsset } from "@/components/ui/media-asset";
import { technologyIcon } from "@/lib/tech-icons";
import type { Project } from "@/lib/types/content";
import { ProjectYoutubeVideo } from "./project-youtube-video";

const cleanText = (value: string) =>
  value
    .split(/\r?\n/)
    .filter((line, index, lines) => {
      const current = line.trim();
      const next = lines[index + 1]?.trim() ?? "";
      return (
        !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(current) &&
        !(
          current.includes("|") &&
          /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(next)
        )
      );
    })
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed.includes("|")) return trimmed;
      return trimmed
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean)
        .join(": ");
    })
    .join(" ")
    .replace(/[*_`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

const text = (value: unknown) =>
  typeof value === "string" ? cleanText(value) : "";
const list = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map(cleanText)
        .filter(Boolean)
    : [];

function SectionImages({ images }: { images: unknown }) {
  const items = Array.isArray(images)
    ? images.filter(
        (item): item is { url: string; alt?: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { url?: unknown }).url === "string",
      )
    : [];
  if (!items.length) return null;
  const pair = items.length > 1;
  return (
    <div
      className={`flex w-full max-w-320 flex-col items-center justify-center gap-2.5 ${
        pair ? "m:grid m:grid-cols-[minmax(0,1fr)_32%] m:items-stretch" : ""
      }`}
    >
      {items.map((image, index) => (
        <Reveal
          key={`${image.url}-${index}`}
          delay={index * 0.1}
          className={`touch-frame relative w-full ${pair && index === 1 ? "m:h-full" : ""}`}
        >
          <div
            className={
              pair && index === 1
                ? "relative h-full min-h-60"
                : "relative aspect-video"
            }
          >
            <MediaAsset
              item={{
                kind: "image",
                url: image.url,
                alt: image.alt ?? "",
                poster: null,
              }}
              sizes={
                pair && index === 1
                  ? "(min-width: 810px) 350px, 100vw"
                  : "(min-width: 1200px) 1100px, 100vw"
              }
            />
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function EditorialSection({
  number,
  title,
  children,
  images,
}: {
  number: number;
  title: string;
  children: ReactNode;
  images?: unknown;
}) {
  return (
    <div className="relative flex w-full flex-col items-center gap-20">
      <Reveal className="relative flex w-full max-w-360 flex-col items-start justify-center gap-7.5 m:px-20 l:px-57.5">
        <p className="w-full max-w-10 type-body-1 text-black-token m:absolute m:top-0 m:left-0">
          {String(number).padStart(3, "0")}
        </p>
        <div className="flex min-w-0 w-full flex-col items-start justify-start gap-10">
          <h2 className="type-heading-4 text-black-token">{title}</h2>
          <div className="prose-flow w-full">{children}</div>
        </div>
      </Reveal>
      {images !== undefined && <SectionImages images={images} />}
    </div>
  );
}

function Technology({ name }: { name: string }) {
  const label = cleanText(name);
  const icon = technologyIcon(label);
  return (
    <li className="flex items-center gap-3 border-b border-black-a10 py-3 type-body-2">
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
        <IconCode aria-hidden className="size-5 shrink-0 text-black-a50" />
      )}
      <span>{label}</span>
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
    <EditorialSection number={8} title="Repositories">
      <div className="flex flex-col gap-6">
        <p className="type-body-2">Verified source links for this project.</p>
        <div className="grid gap-3 m:grid-cols-2">
          {repositories.map((repo) => (
            <a
              key={repo.url}
              href={repo.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-[6px] border border-black-a10 p-4 transition-colors hover:bg-neutral-50"
            >
              <span className="type-body-3 uppercase text-black-a50">
                {repo.role ?? "repository"}
              </span>
              <span className="mt-2 block type-body-2">
                {repo.owner}/{repo.name}
              </span>
              <span className="mt-2 block type-body-3 text-black-a60">
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
      </div>
    </EditorialSection>
  );
}

function ProjectGallery({ project }: { project: Project }) {
  if (!project.gallery.length) return null;
  return (
    <div className="flex w-full max-w-360 flex-col gap-3 m:grid m:grid-cols-2">
      {project.gallery.map((item) => (
        <Reveal
          key={item.url}
          className="relative aspect-video overflow-hidden rounded-[6px] bg-neutral-50"
        >
          <MediaAsset item={item} sizes="(min-width: 768px) 50vw, 100vw" />
        </Reveal>
      ))}
    </div>
  );
}

export function ProjectTemplateRenderer({ project }: { project: Project }) {
  const content = project.studioContent ?? {};
  const sectionImages = content.sectionImages ?? {};
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
        titleBelowMedia
      />
      <article className="relative z-1 flex w-full flex-none flex-col items-center justify-center gap-20 bg-white-token px-6 py-20 m:pb-30 l:px-32.75">
        <Curtain className="bg-white-token" />
        <div className="relative h-px w-full max-w-360 bg-black-a16" />

        <EditorialSection
          number={1}
          title={
            deepDive
              ? "System brief"
              : product
                ? "Product brief"
                : openSource
                  ? "Repository overview"
                  : "The project"
          }
          images={sectionImages.brief}
        >
          {paragraphs.length ? (
            paragraphs.map((paragraph) => (
              <p key={paragraph} className="type-body-2">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="type-body-2">{project.intro}</p>
          )}
          <div className="flex flex-wrap gap-6 pt-4">
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
        </EditorialSection>

        {features.length > 0 && (
          <EditorialSection
            number={2}
            title="What it does"
            images={sectionImages.features}
          >
            <p className="type-body-3 text-black-a60">
              {features.length} evidenced features
            </p>
            <ol className="mt-8 grid gap-x-8 gap-y-10 m:grid-cols-2 l:grid-cols-3">
              {features.map((feature, index) => (
                <li
                  key={feature}
                  className="flex flex-col gap-6 border-t border-black-a10 pt-4"
                >
                  <span className="type-body-3 text-black-a60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="type-body-2">{feature}</p>
                </li>
              ))}
            </ol>
          </EditorialSection>
        )}

        {architecture.length > 0 && (
          <EditorialSection
            number={3}
            title={deepDive ? "Architecture deep dive" : "How it works"}
            images={sectionImages.architecture}
          >
            <div className="flex flex-col gap-10">
              {architecture.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="flex flex-col gap-3"
                >
                  <h3 className="type-body-1">{cleanText(item.title)}</h3>
                  <p className="type-body-2">{text(item.body)}</p>
                </div>
              ))}
            </div>
          </EditorialSection>
        )}

        {problem && (
          <EditorialSection
            number={4}
            title="Challenge"
            images={sectionImages.challenge}
          >
            <p className="type-body-2">{problem}</p>
          </EditorialSection>
        )}

        {approach && (
          <EditorialSection
            number={5}
            title="Implementation"
            images={sectionImages.implementation}
          >
            <p className="type-body-2">{approach}</p>
          </EditorialSection>
        )}

        {outcomes.length > 0 && (
          <EditorialSection
            number={6}
            title="Verified outcomes"
            images={sectionImages.outcomes}
          >
            <ul className="flex flex-col gap-6">
              {outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="border-t border-black-a10 pt-4 type-body-2"
                >
                  {outcome}
                </li>
              ))}
            </ul>
          </EditorialSection>
        )}

        <EditorialSection
          number={7}
          title="Technology stack"
          images={sectionImages.techStack}
        >
          <div className="grid gap-10 m:grid-cols-2 l:grid-cols-3">
            {Object.entries(tech).map(([group, values]) => (
              <div key={group}>
                <h3 className="type-body-3 uppercase text-black-a60">
                  {group}
                </h3>
                <ul className="mt-3">
                  {list(values).map((value) => (
                    <Technology key={value} name={value} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </EditorialSection>

        <ProjectYoutubeVideo project={project} />
        <Repositories project={project} />
        <SectionImages images={sectionImages.repositories} />
        <ProjectGallery project={project} />
      </article>
    </>
  );
}
