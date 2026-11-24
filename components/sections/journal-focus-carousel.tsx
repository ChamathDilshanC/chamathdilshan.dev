"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { MediaAsset } from "@/components/ui/media-asset";
import { carouselOffset, wrapCarouselIndex } from "@/lib/journal-carousel";
import type { Post } from "@/lib/types/content";

type Props = {
  posts: Post[];
};

type FocusCardStyle = CSSProperties & {
  "--focus-offset": number;
  "--focus-scale": number;
  "--focus-blur": string;
  "--focus-opacity": number;
};

const SWIPE_THRESHOLD = 38;

function playTap(audioContextRef: { current: AudioContext | null }) {
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) return;

  const context = audioContextRef.current ?? new AudioContextConstructor();
  audioContextRef.current = context;

  if (context.state === "suspended") void context.resume();

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(480, now);
  oscillator.frequency.exponentialRampToValueAtTime(190, now + 0.045);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1_100, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.06);
}

/** A focus carousel inspired by the Journal reference interaction. */
export function JournalFocusCarousel({ posts }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const router = useRouter();
  const pointerStart = useRef<number | null>(null);
  const didSwipe = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);
  const activePost = posts[activeIndex] ?? posts[0];

  const focus = useCallback(
    (nextIndex: number) => {
      if (posts.length < 2) return;
      const wrapped = wrapCarouselIndex(nextIndex, posts.length);
      if (wrapped === activeIndex) return;
      setActiveIndex(wrapped);
      if (soundEnabled) playTap(audioContext);
    },
    [activeIndex, posts.length, soundEnabled],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = event.clientX;
    didSwipe.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (start === null) return;
    const distance = event.clientX - start;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    didSwipe.current = true;
    focus(activeIndex + (distance < 0 ? 1 : -1));
  };

  if (!activePost) return null;

  return (
    <div
      className="relative w-full overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Latest journal articles"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          focus(activeIndex - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          focus(activeIndex + 1);
        }
      }}
    >
      <button
        type="button"
        className="absolute top-0 right-1 z-20 flex size-9 items-center justify-center rounded-full border border-black-a16 bg-white-token text-black-token transition-colors hover:bg-neutral-50 focus-visible:outline-black m:right-4"
        aria-label={soundEnabled ? "Mute carousel sounds" : "Enable carousel sounds"}
        aria-pressed={!soundEnabled}
        onClick={() => setSoundEnabled((enabled) => !enabled)}
      >
        {soundEnabled ? <Volume2 aria-hidden="true" size={15} /> : <VolumeX aria-hidden="true" size={15} />}
      </button>

      <div
        className="relative h-80 touch-pan-y cursor-grab select-none active:cursor-grabbing m:h-108 l:h-120"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
      >
        {posts.map((post, index) => {
          const offset = carouselOffset(index, activeIndex, posts.length);
          const distance = Math.abs(offset);
          const active = distance === 0;
          const style: FocusCardStyle = {
            "--focus-offset": offset,
            "--focus-scale": active ? 1.9 : 1,
            "--focus-blur": active ? "0px" : distance === 1 ? "0.6px" : `${Math.min(5, distance * 1.8)}px`,
            "--focus-opacity": active ? 1 : Math.max(0.36, 0.88 - distance * 0.16),
            zIndex: posts.length - distance,
          };

          return (
            <button
              key={post.slug}
              type="button"
              style={style}
              className="group absolute top-1/2 left-1/2 aspect-[3/4] w-23 -translate-y-1/2 translate-x-[calc(-50%+var(--focus-offset)*9.25rem)] scale-[var(--focus-scale)] overflow-hidden rounded-[3px] bg-black-token opacity-[var(--focus-opacity)] shadow-[0_12px_36px_rgba(0,0,0,0.08)] transition-[transform,filter,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [filter:grayscale(1)_blur(var(--focus-blur))] focus-visible:outline-black m:w-35 m:translate-x-[calc(-50%+var(--focus-offset)*14rem)] l:w-39 l:translate-x-[calc(-50%+var(--focus-offset)*15rem)] data-[active=true]:[filter:none]"
              data-active={active}
              aria-label={active ? `${post.title}, selected article` : `Show ${post.title}`}
              aria-current={active ? "true" : undefined}
              tabIndex={active || distance === 1 ? 0 : -1}
              onClick={() => {
                if (didSwipe.current) {
                  didSwipe.current = false;
                  return;
                }
                if (active) {
                  router.push(`/blog/${post.slug}`);
                  return;
                }
                focus(index);
              }}
            >
              <MediaAsset
                item={post.cover}
                sizes="(min-width: 1200px) 296px, (min-width: 810px) 266px, 175px"
                preload={index === 0}
                className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
              />
            </button>
          );
        })}
      </div>

      <div className="mx-auto -mt-1 grid w-[min(88vw,17.5rem)] grid-cols-[1fr_auto_1fr] items-start gap-3 m:-mt-2 m:w-[min(64vw,33rem)]">
        <span className="min-w-0 truncate pt-1 text-left font-geist text-[11px] font-medium text-black-a60 m:text-xs">
          {activePost.category}
        </span>
        <span className="text-[8px] leading-none text-black-token" aria-hidden="true">
          ▲
        </span>
        <Link
          href={`/blog/${activePost.slug}`}
          className="min-w-0 truncate pt-1 text-right font-geist text-[11px] font-medium text-black-token underline-offset-4 hover:underline focus-visible:outline-black m:text-xs"
        >
          {activePost.title}
        </Link>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Article {activeIndex + 1} of {posts.length}: {activePost.title}
      </p>
    </div>
  );
}
