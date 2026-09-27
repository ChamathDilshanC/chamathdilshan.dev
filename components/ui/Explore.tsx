"use client";
import { useEffect, useRef } from "react";
import { Compass, X } from "lucide-react";
import { journey, useExperience } from "@/stores/experience-store";
import { portfolio } from "@/config/portfolio";
export default function Explore() {
  const enabled = useExperience((s) => s.explore);
  const flat = useExperience((s) => s.flat);
  const reduced = useExperience((s) => s.reducedMotion);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const trigger = button.current;
    const held = new Set<string>();
    let raf = 0;
    let last = performance.now();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keydown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("dialog, input, select")) return;
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "shift", " ", "e", "escape"].includes(key))
        e.preventDefault();
      held.add(key);
      if (key === "escape")
        useExperience.getState().set({ explore: false, phase: "CONTACT" });
      if (key === "e")
        useExperience
          .getState()
          .set({ project: portfolio.projects[3]!.id, phase: "PROJECT_VIEW" });
      if (key === " ") journey.explore.dodge = performance.now() / 1000 + 0.5;
    };
    const keyup = (e: KeyboardEvent) => held.delete(e.key.toLowerCase());
    const blur = () => held.clear();
    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      const x = Number(held.has("d")) - Number(held.has("a"));
      const z = Number(held.has("s")) - Number(held.has("w"));
      journey.explore.moving = !!(x || z) && !useExperience.getState().project;
      journey.explore.sprint = held.has("shift");
      if (journey.explore.moving) {
        const speed =
          (delta * (held.has("shift") ? 5 : 2.4)) /
          Math.max(1, Math.hypot(x, z));
        journey.explore.x = Math.max(
          -5,
          Math.min(5, journey.explore.x + x * speed),
        );
        journey.explore.z = Math.max(
          -5,
          Math.min(5, journey.explore.z + z * speed),
        );
        journey.explore.yaw = Math.atan2(x, z);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
      document.body.style.overflow = overflow;
      journey.explore.moving = false;
      trigger?.focus();
    };
  }, [enabled]);
  if (flat || reduced) return null;
  return (
    <>
      <button
        ref={button}
        className="text-link explore-button"
        onClick={() => {
          journey.explore.x = 0;
          journey.explore.z = 0;
          useExperience.getState().set({ explore: true, phase: "EXPLORE" });
        }}
      >
        <Compass size={15} />
        Linger at the summit
      </button>
      {enabled && (
        <div
          className="explore-hud"
          role="region"
          aria-label="Explore controls"
        >
          <span>THE SUMMIT · EXPLORE</span>
          <p>WASD to move the camera · Shift to move faster · E to discover</p>
          <button
            className="hud-button"
            onClick={() =>
              useExperience.getState().set({ explore: false, phase: "CONTACT" })
            }
          >
            <X size={16} />
            Exit exploration · Esc
          </button>
        </div>
      )}
    </>
  );
}
