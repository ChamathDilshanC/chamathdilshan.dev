import { ArrowLink } from "@/components/ui/arrow-link";
import { SectionTitle } from "@/components/ui/section-title";
import { JournalFocusCarousel } from "@/components/sections/journal-focus-carousel";
import type { HomeJournal, Post } from "@/lib/types/content";

/** Latest articles in an interactive focus carousel. */
export function Journal({ journal, posts }: { journal: HomeJournal; posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section id="journal" className="relative z-1 flex w-full flex-none scroll-mt-6 flex-col items-center justify-start gap-12 bg-white-token px-6 pt-6 pb-20 m:gap-16 m:pb-30 l:gap-14">
      <div className="w-full max-w-360">
        <SectionTitle title={journal.title} aside={journal.aside} />
      </div>
      <JournalFocusCarousel posts={posts} />
      <div className="flex w-full max-w-360 justify-center">
        <ArrowLink href={journal.cta.href} variant="dark">
          {journal.cta.label}
        </ArrowLink>
      </div>
    </section>
  );
}
