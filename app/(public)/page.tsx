import { Fragment, type ReactNode } from "react";
import { CtaBand } from "@/components/sections/cta-band";
import { HomeAbout } from "@/components/sections/home-about";
import { HomeHero } from "@/components/sections/home-hero";
import { Journal } from "@/components/sections/journal";
import { Numbers } from "@/components/sections/numbers";
import { Pricing } from "@/components/sections/pricing";
import { SelectedWork } from "@/components/sections/selected-work";
import { Services } from "@/components/sections/services";
import { StackStrip } from "@/components/sections/stack-strip";
import { Testimonials } from "@/components/sections/testimonials";
import { getPosts, getProjects, getSiteContent, getSkills } from "@/lib/content";
import type { HomeBlock } from "@/lib/types/content";

export default async function HomePage() {
  const [content, projects, posts, skills] = await Promise.all([
    getSiteContent(),
    getProjects(),
    getPosts(),
    getSkills(),
  ]);

  const blocks: Record<HomeBlock, () => ReactNode> = {
    about: () => <HomeAbout about={content["home.about"]} />,
    stack: () => <StackStrip skills={skills} />,
    work: () => <SelectedWork work={content["home.work"]} projects={projects} />,
    services: () => <Services services={content["home.services"]} />,
    pricing: () => <Pricing pricing={content["home.pricing"]} />,
    testimonials: () => (
      <Testimonials
        testimonials={content["home.testimonials"]}
        projects={projects.map(({ slug, title, thumbnail }) => ({ slug, title, thumbnail }))}
      />
    ),
    cta: () => <CtaBand cta={content["home.cta"]} />,
    numbers: () => <Numbers numbers={content["home.numbers"]} />,
    journal: () => <Journal journal={content["home.journal"]} posts={posts} />,
  };

  // Order and visibility come from Sections → Home layout in the admin panel.
  const seen = new Set<HomeBlock>();
  const layout = content["home.layout"].sections.filter((entry) => {
    if (!entry.visible || seen.has(entry.section) || !(entry.section in blocks)) return false;
    seen.add(entry.section);
    return true;
  });

  return (
    <>
      <HomeHero />
      {layout.map((entry) => (
        <Fragment key={entry.section}>{blocks[entry.section]()}</Fragment>
      ))}
    </>
  );
}
