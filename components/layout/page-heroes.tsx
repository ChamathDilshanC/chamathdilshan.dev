import { HeroPhoto, heroZoom } from "@/components/ui/hero-photo";
import { Media } from "@/components/ui/media";
import { MediaAsset } from "@/components/ui/media-asset";
import { videoPoster } from "@/lib/media";
import type { MediaItem, NavKey } from "@/lib/types/content";
import { enter, heroImageEnter } from "@/lib/enter";
import { SiteHeader } from "./site-header";
import { StickyHero } from "./sticky-hero";

type ImageProps = { image: string; imageAlt: string };

/** Full-bleed, slightly oversized blurred backdrop that zooms out on load (About). */
function Backdrop({
  image,
  imageAlt,
  className,
}: ImageProps & { className?: string }) {
  return (
    <div className={`absolute -inset-[5%] ${className}`}>
      <div className="animate-enter absolute inset-0" style={heroImageEnter}>
        <Media src={image} alt={imageAlt} sizes="110vw" preload />
      </div>
    </div>
  );
}

/** Listing hero ("Latest Projects (04)") used by /projects and /blog. */
export function ListHero({
  active,
  title,
  count,
  description,
  image,
  imageAlt,
}: ImageProps & {
  active: NavKey;
  title: readonly string[];
  count: number;
  description: string;
}) {
  return (
    <StickyHero className="group/hero justify-between p-6">
      <HeroPhoto fill={image} zoom className="opacity-70">
        <Media src={image} alt={imageAlt} sizes="100vw" preload />
      </HeroPhoto>
      <SiteHeader active={active} />
      <div className="h-17.5 w-full flex-none" />
      <div className="relative flex w-full max-w-360 items-end justify-start gap-2.5 m:justify-between m:gap-0">
        <div className="flex w-full flex-col items-start justify-start gap-2.5 m:max-w-112.5 m:gap-5 l:max-w-249.75 l:flex-row l:content-end l:items-end l:justify-between l:gap-0">
          <h1 className="flex w-min flex-col flex-wrap content-start items-start justify-center m:flex-nowrap">
            <span className="flex items-start justify-start gap-1.5 self-stretch">
              <span className="animate-enter type-heading-2" style={enter(0.8)}>
                {title[0]}
              </span>
              <span className="animate-enter type-body-1" style={enter(0.9)}>
                ({String(count).padStart(2, "0")})
              </span>
            </span>
            <span className="animate-enter type-heading-2" style={enter(0.9)}>
              {title[1]}
            </span>
          </h1>
          <p
            className="animate-enter w-full max-w-[200.5px] type-body-3 text-white-a50"
            style={enter(1)}
          >
            {description}
          </p>
        </div>
      </div>
    </StickyHero>
  );
}

/** Case-study hero: centred title, category and summary along the bottom. The backdrop can be a video. */
export function CaseHero({
  title,
  category,
  summary,
  media,
}: {
  title: string;
  category: string;
  summary: string;
  media: MediaItem;
}) {
  return (
    <StickyHero className="group/hero justify-start p-6">
      <HeroPhoto
        fill={
          media.kind === "video"
            ? (media.poster ?? videoPoster(media.url))
            : media.url
        }
        zoom
        className="opacity-70"
      >
        <MediaAsset item={media} sizes="100vw" preload />
      </HeroPhoto>
      <SiteHeader active="projects" />
      <div className="h-17.5 w-full flex-none" />
      <div className="relative flex w-full flex-1 flex-col items-center justify-between l:max-w-360">
        <div className="h-px w-full" />
        <div className="flex w-full items-center justify-center">
          <h1
            className="animate-enter max-w-225 text-center type-heading-2"
            style={enter(0.8)}
          >
            {title}
          </h1>
        </div>
        <div className="flex w-full items-start justify-between px-2.5 m:px-0">
          <div className="flex w-full items-start justify-between gap-6 m:max-w-112.5 l:max-w-215">
            <p
              className="animate-enter type-body-3 text-white-token"
              style={enter(0.9)}
            >
              {category}
            </p>
            <p
              className="animate-enter max-w-[200.5px] type-body-4"
              style={enter(1)}
            >
              {summary}
            </p>
          </div>
        </div>
      </div>
    </StickyHero>
  );
}

/** About hero: blurred backdrop, a sharp inset frame with the title, and a caption row. */
export function AboutHero({
  title,
  label,
  blurb,
  image,
  imageAlt,
}: ImageProps & { title: string; label: string; blurb: string }) {
  return (
    <StickyHero className="justify-start gap-17.5 p-6">
      <Backdrop image={image} imageAlt="" className="blur-[5px]" />
      <SiteHeader active="about" />
      <div className="h-17.5 w-full flex-none" />
      <div
        className="animate-enter relative flex h-[66%] w-full flex-col items-center justify-center gap-2.5 m:h-[70%] l:h-[66%] l:max-w-231"
        style={enter(0.7, { y: "40px" })}
      >
        <div className="group/hero relative flex h-88.5 w-full flex-none flex-col items-center justify-center overflow-hidden rounded-[5px] m:h-91 l:h-auto l:flex-1">
          <div className={`absolute inset-0 ${heroZoom}`}>
            <Media
              src={image}
              alt={imageAlt}
              sizes="(min-width: 1200px) 924px, 100vw"
            />
          </div>
          <h1 className="relative text-center type-heading-2">{title}</h1>
        </div>
        <div className="flex w-full items-start justify-between gap-6 m:max-w-112.5 l:max-w-157.5">
          <p className="type-body-3 text-white-token">{label}</p>
          <p className="max-w-60 type-body-3 text-white-token [text-shadow:0_1px_12px_rgb(0_0_0/0.55)]">
            {blurb}
          </p>
        </div>
      </div>
    </StickyHero>
  );
}

/** Article hero: an inset, rounded cover with category, title, excerpt and date. */
export function PostHero({
  title,
  category,
  excerpt,
  date,
  media,
  titleBelowMedia = false,
}: {
  title: string;
  category: string;
  excerpt: string;
  date: string;
  media: MediaItem;
  titleBelowMedia?: boolean;
}) {
  return (
    <StickyHero className="justify-start bg-black-token p-6">
      <SiteHeader active="projects" />
      <div className="h-17.5 w-full flex-none" />
      <div
        className={`group/hero animate-enter relative w-full overflow-hidden rounded-[5px] l:max-w-360 ${
          titleBelowMedia
            ? "h-[60%]"
            : "flex h-[70%] flex-col items-center justify-between p-6"
        }`}
        style={enter(0.6, { y: "40px" })}
      >
        <div className={`absolute inset-0 opacity-70 ${heroZoom}`}>
          <MediaAsset
            item={media}
            sizes="(min-width: 1200px) 1440px, 100vw"
            fit="contain"
            preload
          />
        </div>
        {!titleBelowMedia && (
          <>
            <div className="hidden h-4 w-full m:block" />
            <div className="relative flex w-full flex-col items-start justify-center gap-6 m:items-center">
              <p className="w-full max-w-77.5 text-left type-body-3 m:text-center">
                {category}
              </p>
              <h1 className="max-w-260 text-left type-heading-2 m:text-center">
                {title}
              </h1>
            </div>
            <div className="relative flex w-full items-start justify-start gap-1">
              <p className="type-body-3">Date:</p>
              <p className="type-body-3 text-white-a50">{date}</p>
            </div>
          </>
        )}
      </div>
      {titleBelowMedia ? (
        <div className="mt-5 w-full max-w-360">
          <h1 className="w-full whitespace-nowrap text-[clamp(1.5rem,6.5vw,6.25rem)] leading-none font-medium tracking-[-0.06em] text-white-token">
            {title}
          </h1>
          <p className="mt-5 w-full max-w-220 type-body-4">{excerpt}</p>
          <div className="mt-4 flex w-full items-start justify-between gap-6 type-body-3">
            <p>{category}</p>
            <p className="text-white-a50">Date: {date}</p>
          </div>
        </div>
      ) : (
        <p className="mt-5 w-full max-w-180 px-6 text-center type-body-4 l:max-w-220">
          {excerpt}
        </p>
      )}
    </StickyHero>
  );
}
