import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostHero } from "@/components/layout/page-heroes";
import { Curtain } from "@/components/motion/curtain";
import { Reveal } from "@/components/motion/reveal";
import { PostGrid } from "@/components/sections/card-grids";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { PlaceholderProvider } from "@/components/ui/placeholders";
import { SectionTitle } from "@/components/ui/section-title";
import { formatPostDate } from "@/content/posts";
import { cn } from "@/lib/cn";
import { getPost, getPosts } from "@/lib/content";
import { placeholders } from "@/lib/placeholders";
import type { Post, PostSection } from "@/lib/types/content";

// Articles published in the admin panel are rendered on first visit, then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", publishedTime: post.date },
  };
}

function SectionImages({ images }: { images: PostSection["images"] }) {
  const pair = images.length > 1;
  return (
    <div
      className={cn(
        "flex w-full max-w-320 flex-col items-center justify-center gap-2.5",
        pair && "m:grid m:grid-cols-[minmax(0,1fr)_87.5] m:items-stretch",
      )}
    >
      {images.map((image, i) => (
        <Reveal
          key={`${i}-${image.url}`}
          duration={0.8}
          delay={0.1 * i}
          className={cn(
            "touch-frame relative w-full",
            pair && i === 1 && "m:h-full",
          )}
        >
          <ImageLightbox
            src={image.url}
            alt={image.alt}
            sizes={pair && i === 1 ? "(min-width: 810px) 350px, 100vw" : "(min-width: 1200px) 1100px, 100vw"}
            fillHeight={pair && i === 1}
          />
        </Reveal>
      ))}
    </div>
  );
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const [post, posts] = await Promise.all([getPost(slug), getPosts()]);
  if (!post) notFound();
  const previews = await placeholders([post.cover.url]);

  const index = Math.max(0, posts.findIndex((p) => p.slug === post.slug));
  const more = [1, 2, 3]
    .map((step) => posts[(index + step) % posts.length])
    .filter((p): p is Post => p !== undefined && p.slug !== post.slug)
    .filter((p, i, list) => list.indexOf(p) === i);

  return (
    <>
      <PlaceholderProvider value={previews}>
        <PostHero
          title={post.title}
          category={post.category}
          excerpt={post.excerpt}
          date={formatPostDate(post.date)}
          image={post.cover.url}
          imageAlt={post.cover.alt}
        />
      </PlaceholderProvider>

      <article className="relative z-1 flex w-full flex-none flex-col items-center justify-center gap-20 bg-white-token px-6 py-20 m:pb-30 l:pr-32.75 l:pl-62">
        <Curtain className="bg-white-token" />
        <div className="relative h-px w-full max-w-360 bg-black-a16" />
        {post.sections.map((section, i) => (
          <div key={`${i}-${section.title}`} className="relative flex w-full flex-col items-center gap-20">
            <Reveal className="flex w-full max-w-360 flex-col items-start justify-center gap-7.5 m:flex-row m:gap-47.5">
              <p className="w-full max-w-10 type-body-1 text-black-token">{String(i + 1).padStart(3, "0")}</p>
              <div className="flex w-full flex-col items-start justify-start gap-10">
                <h2 className="type-heading-4 text-black-token">{section.title}</h2>
                <div className="prose-flow w-full max-w-177.5">
                  {section.paragraphs.map((paragraph, j) => (
                    <p key={j} className="type-body-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
            {section.images.length > 0 && <SectionImages images={section.images} />}
          </div>
        ))}
      </article>

      {more.length > 0 && (
        <section className="relative z-1 flex w-full flex-none flex-col items-center justify-start gap-15 bg-white-token px-6 pt-6 pb-20 m:gap-20 m:pb-30 l:gap-17.5">
          <div className="w-full max-w-360">
            <SectionTitle title="More Articles" aside="Keep reading" />
          </div>
          <div className="w-full max-w-360">
            <PostGrid posts={more} columns={3} />
          </div>
        </section>
      )}
    </>
  );
}
