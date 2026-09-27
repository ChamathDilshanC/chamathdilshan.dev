"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { journey, useExperience } from "@/stores/experience-store";
import {
  routeProgressFromScroll,
  scrollProgressForRoute,
} from "./gunship-flight";
import { phaseAt } from "./character-animations";

gsap.registerPlugin(ScrollTrigger);
const anchors = [
  "journey",
  "projects",
  "passage",
  "skills",
  "experience",
  "about",
  "contact",
];
const points = [0, 0.15, 0.35, 0.55, 0.7, 0.82, 0.92, 1].map(
  scrollProgressForRoute,
);
export function useScrollTimeline() {
  const reduced = useExperience((s) => s.reducedMotion);
  const flat = useExperience((s) => s.flat);
  useEffect(() => {
    const lenis =
      reduced || flat
        ? null
        : new Lenis({ duration: 0.85, smoothWheel: true, anchors: true });
    lenis?.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    let timeline: gsap.core.Timeline;
    const build = () => {
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight,
      );
      const elements = anchors.map((id) => document.getElementById(id));
      const positions = elements.map((element) => element?.offsetTop ?? 0);
      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: 0,
          end: max,
          // Lenis smooths input; the scene applies one shared delta-time filter.
          scrub: true,
        },
        onUpdate: () => {
          journey.requestFrame?.();
          const p = routeProgressFromScroll(journey.progress);
          const state = useExperience.getState();
          const chapter =
            p < 0.15
              ? 0
              : p < 0.55
                ? 1
                : p < 0.7
                  ? 2
                  : p < 0.82
                    ? 3
                    : p < 0.92
                      ? 4
                      : 5;
          const phase = state.project
            ? "PROJECT_VIEW"
            : state.explore
              ? "EXPLORE"
              : phaseAt(p);
          if (chapter !== state.chapter || phase !== state.phase)
            state.set({ chapter, phase });
          document.documentElement.style.setProperty(
            "--journey-progress",
            String(p),
          );
        },
      });
      positions.forEach((pos, i) => {
        const next = i === positions.length - 1 ? max : positions[i + 1]!;
        timeline.fromTo(
          journey,
          { progress: points[i] },
          {
            immediateRender: false,
            progress: points[i + 1],
            duration: Math.max(1, next - pos),
            ease: "none",
          },
        );
      });
      ScrollTrigger.refresh();
    };
    build();
    const observer = new ResizeObserver(() => {
      build();
    });
    observer.observe(document.getElementById("main-content")!);
    const unsub = useExperience.subscribe((state) => {
      if (
        state.project ||
        state.explore ||
        state.driving ||
        state.annotation !== null
      )
        lenis?.stop();
      else lenis?.start();
    });
    const move = (event: PointerEvent) => {
      journey.pointer.x = (event.clientX / innerWidth) * 2 - 1;
      journey.pointer.y = -((event.clientY / innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      observer.disconnect();
      unsub();
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      gsap.ticker.remove(tick);
      lenis?.destroy();
      window.removeEventListener("pointermove", move);
    };
  }, [reduced, flat]);
}
