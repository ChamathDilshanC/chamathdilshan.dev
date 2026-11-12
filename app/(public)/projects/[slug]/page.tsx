import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { LetterReveal } from "@/components/motion/letter-reveal";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { WorkGrid } from "@/components/sections/card-grids";
import { LabelledRow, StatRows } from "@/components/sections/stat-rows";
import { ArrowLink } from "@/components/ui/arrow-link";
import { MediaAsset } from "@/components/ui/media-asset";
import { PlaceholderProvider } from "@/components/ui/placeholders";
import { SectionTitle } from "@/components/ui/section-title";
import { ProjectTemplateRenderer } from "@/components/projects/project-template-renderer";
import { getProject, getProjects } from "@/lib/content";
import { placeholders } from "@/lib/placeholders";
import { absoluteUrl, imageUrl, JsonLd, pageMetadata, siteUrl } from "@/lib/seo";
import type { Project } from "@/lib/types/content";

// Projects added in the admin panel are rendered on first visit, then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
    image: project.thumbnail.url,
  });
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const [project, projects] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();
  const previews = await placeholders([project.hero.kind === "image" ? project.hero.url : null]);

  if (project.template && project.template !== "legacy") {
    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            description: project.seo?.description || project.summary,
            url: absoluteUrl(`/projects/${project.slug}`),
            image: imageUrl(project.thumbnail.url),
            author: { "@type": "Person", name: "Chamath Dilshan", url: siteUrl },
            ...(project.tech.length > 0 ? { keywords: project.tech.join(", ") } : {}),
          }}
        />
        <ProjectTemplateRenderer project={project} />
      </>
    );
  }

  const index = projects.findIndex((p) => p.slug === project.slug);
  const more =
    projects.length > 1
      ? [1, 2]
          .map((step) => projects[(Math.max(index, 0) + step) % projects.length])
          .filter((p): p is Project => p !== undefined && p.slug !== project.slug)
          .filter((p, i, list) => list.indexOf(p) === i)
      : [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: absoluteUrl(`/projects/${project.slug}`),
          image: imageUrl(project.thumbnail.url),
          author: { "@type": "Person", name: "Chamath Dilshan", url: siteUrl },
          ...(project.tech.length > 0 ? { keywords: project.tech.join(", ") } : {}),
          ...(project.liveUrl ? { mainEntityOfPage: project.liveUrl } : {}),
        }}
      />
      <PlaceholderProvider value={previews}>
        <CaseHero title={project.title} category={project.category} summary={project.summary} media={project.hero} />
      </PlaceholderProvider>

      <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start bg-white-token px-6 pt-6 pb-20 m:pb-30">
        <Curtain className="bg-white-token" />
        <div className="relative flex w-full max-w-360 flex-col items-center justify-center gap-15 m:gap-20">
          <SectionTitle title="The Project" aside={project.year ? `${project.year} · Brief, process & results` : "Brief, process & results"} />
          <LetterReveal text={project.intro} className="w-full type-heading-3 [--indent:22%] l:[--indent:37.5%]" />
        </div>

        <div className="h-10 w-full flex-none m:h-12.5 l:h-27.5" />

        <div className="relative flex w-full max-w-360 flex-col items-start justify-start gap-10 m:gap-12.5 l:flex-row l:gap-20">
          <Reveal className="z-1 flex w-full max-w-181.25 flex-col items-start justify-center gap-10 pt-12.5 m:gap-20 l:sticky l:top-12.5">
            {project.discover && (
              <LabelledRow label="(Discover)">
                <p className="type-body-2">{project.discover}</p>
              </LabelledRow>
            )}
            {project.explore && (
              <LabelledRow label="(Explore)">
                <p className="type-body-2">{project.explore}</p>
              </LabelledRow>
            )}
            {project.tech.length > 0 && (
              <LabelledRow label="(Stack)">
                <ul className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <li key={tech} className="rounded-[5px] bg-neutral-50 px-3 py-1.5 type-body-3 text-black-token">
                      {tech}
                    </li>
                  ))}
                </ul>
              </LabelledRow>
            )}
            <div className="flex w-full flex-col items-start justify-start gap-5 m:flex-row m:gap-50">
              <p className="w-full max-w-25 type-body-1 text-black-token m:w-px m:flex-1">(Results)</p>
              <div className="flex w-full flex-col items-start justify-center gap-10 m:w-px m:flex-1 m:gap-20 l:gap-27.5">
                {project.results.length > 0 && <StatRows rows={project.results} />}
                <div className="flex flex-col gap-6">
                  {project.liveUrl && (
                    <ArrowLink href={project.liveUrl} variant="dark">
                      Visit Live Site
                    </ArrowLink>
                  )}
                  {project.repoUrl && (
                    <ArrowLink href={project.repoUrl} variant="dark">
                      View Source
                    </ArrowLink>
                  )}
                  <ArrowLink href="/contact" variant="dark">
                    Start a Project
                  </ArrowLink>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="flex w-full flex-col items-center justify-center gap-2.5 l:w-px l:flex-1">
            {project.gallery.map((item, i) => (
              <Reveal key={`${i}-${item.url}`} duration={0.8} className="w-full">
                <Parallax className="relative h-151.75 w-full overflow-hidden rounded-[5px] m:h-svh l:h-151.75">
                  <MediaAsset item={item} sizes="(min-width: 1200px) 50vw, 100vw" />
                </Parallax>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="relative z-2 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pb-20 m:gap-20 m:pb-30 l:gap-17.5">
          <div className="w-full max-w-360">
            <SectionTitle title="More Work" aside="Keep exploring" />
          </div>
          <div className="w-full max-w-360">
            <WorkGrid projects={more} />
          </div>
        </section>
      )}
    </>
  );
}
