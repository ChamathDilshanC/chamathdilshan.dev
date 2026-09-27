"use client";
import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  Settings2,
  Volume2,
  VolumeX,
  X,
  Menu,
  RotateCcw,
} from "lucide-react";
import { portfolio } from "@/config/portfolio";
import { useExperience, type Quality } from "@/stores/experience-store";
import { useScrollTimeline } from "@/animation/scroll-timeline";
import ProjectPanel from "./ProjectPanel";
import WebVitals from "./WebVitals";
import ModelControls from "./ModelControls";
import VehicleInteractions from "./VehicleInteractions";
const DebugPanel =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./DebugPanel"), { ssr: false })
    : () => null;
const World = dynamic(() => import("@/components/canvas/World"), {
  ssr: false,
});

class WorldBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useExperience.getState().set({ flat: true, ready: true });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Experience({ children }: { children: ReactNode }) {
  const chapter = useExperience((s) => s.chapter);
  const phase = useExperience((s) => s.phase);
  const modelsLoading = useExperience((s) => s.modelsLoading);
  const modelProgress = useExperience((s) => s.modelProgress);
  const modelError = useExperience((s) => s.modelError);
  const flat = useExperience((s) => s.flat);
  const ready = useExperience((s) => s.ready);
  const quality = useExperience((s) => s.quality);
  const auto = useExperience((s) => s.autoQuality);
  const reduced = useExperience((s) => s.reducedMotion);
  const annotation = useExperience((s) => s.annotation);
  const driving = useExperience((s) => s.driving);
  const set = useExperience((s) => s.set);
  const [mounted, setMounted] = useState(false);
  const [menu, setMenu] = useState(false);
  const settings = useRef<HTMLDialogElement>(null);
  useScrollTimeline();
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => set({ reducedMotion: media.matches });
    update();
    media.addEventListener("change", update);
    const mobile = matchMedia("(max-width: 760px)").matches;
    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2");
      webgl = !!context;
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      /* Keep the accessible layer. */
    }
    let stored = "";
    try {
      stored = localStorage.getItem("journey-display") ?? "";
    } catch {
      /* Storage is optional. */
    }
    set({
      flat: !webgl || stored === "still",
      quality: mobile ? "LOW" : "HIGH",
      ready: !webgl || stored === "still",
    });
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", update);
    };
  }, [set]);
  return (
    <div
      data-hydrated={mounted}
      className={`experience ${flat ? "is-flat" : "is-world"} ${reduced ? "reduced-motion" : ""} ${annotation !== null ? "is-inspecting" : ""} ${driving ? "is-driving" : ""}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to portfolio content
      </a>
      <div className="world-backdrop" aria-hidden="true" />
      {mounted && !flat && (
        <div className={`world-canvas ${ready ? "is-ready" : ""}`}>
          <WorldBoundary>
            <World />
          </WorldBoundary>
        </div>
      )}
      <div className="world-grade" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      {!flat && (modelsLoading || modelError) && (
        <div className="model-loading" role="status">
          {modelError
            ? "Some scenery could not load. You can keep exploring."
            : `Bringing the world to life · ${Math.round(modelProgress)}%`}
        </div>
      )}
      {!flat && (
        <aside className="world-label" aria-label="Current 3D scene">
          <span className="world-label-kicker">
            <span className="live-dot" /> LIVE WORLD /{" "}
            {phase === "COMBAT_TRANSITION"
              ? "03"
              : chapter === 1 || chapter === 3 || chapter === 4
                ? "02"
                : "01"}
          </span>
          <span className="world-label-title">
            {phase === "COMBAT_TRANSITION"
              ? "Decepticon flight"
              : chapter === 1 || chapter === 3 || chapter === 4
                ? "The shadow keeper"
                : "The crystal guardian"}
          </span>
          <span className="world-label-detail">
            {phase === "COMBAT_TRANSITION"
              ? "A study in motion & machinery"
              : "Fantasy, brought into focus"}
          </span>
          <div className="world-label-track">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <ModelControls />
        </aside>
      )}
      <header className="site-header">
        <a className="brand" href="#journey" aria-label="Return to beginning">
          <span className="brand-mark" aria-hidden="true">
            {portfolio.profile.monogram}
          </span>
          <span>
            {portfolio.editorial.brand}
            <span className="brand-sub">{portfolio.editorial.subtitle}</span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Chapters">
          {portfolio.chapters.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={chapter === i ? "location" : undefined}
            >
              <span>{item.number}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className="mobile-menu icon-button"
          aria-label={menu ? "Close navigation" : "Open navigation"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      {menu && (
        <nav className="mobile-nav" aria-label="Mobile chapters">
          {portfolio.chapters.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenu(false)}
            >
              <span>{item.number}</span>
              {item.label}
              <span>↗</span>
            </a>
          ))}
        </nav>
      )}
      <aside className="chapter-marker" aria-hidden="true">
        <span>{portfolio.chapters[chapter]!.number} / 06</span>
        <span className="marker-line" />
        <span>{portfolio.chapters[chapter]!.title}</span>
      </aside>
      <main
        id="main-content"
        tabIndex={-1}
        inert={annotation !== null || driving}
      >
        {children}
      </main>
      <footer className="experience-hud">
        <a
          href={
            chapter === 5
              ? "#journey"
              : `#${portfolio.chapters[chapter + 1]!.id}`
          }
          className="scroll-cue"
        >
          <span className="scroll-icon">
            {chapter === 5 ? <RotateCcw size={14} /> : <ArrowDown size={14} />}
          </span>
          {chapter === 5
            ? "Begin again"
            : chapter === 0
              ? "Scroll to begin"
              : "Continue the journey"}
        </a>
        <span className="hud-caption">{portfolio.profile.location}</span>
        <div className="hud-controls">
          <SoundToggle />
          <button
            className="hud-button"
            onClick={() => settings.current?.showModal()}
            aria-label="Experience settings"
          >
            <Settings2 size={15} />
            <span>Settings</span>
          </button>
        </div>
      </footer>
      <div className="journey-progress" aria-hidden="true" />
      {mounted && !ready && !flat && (
        <div className="loading-note" role="status">
          <span className="ink-ring" />
          <span>Preparing the journey</span>
          <button onClick={() => set({ flat: true, ready: true })}>
            Continue in still mode
          </button>
        </div>
      )}
      <dialog
        ref={settings}
        className="settings-dialog"
        aria-labelledby="settings-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) settings.current?.close();
        }}
      >
        <div className="settings-inner" data-lenis-prevent>
          <div className="panel-top">
            <span className="eyebrow">Make yourself at home</span>
            <button
              className="icon-button"
              onClick={() => settings.current?.close()}
              aria-label="Close settings"
            >
              <X size={21} />
            </button>
          </div>
          <h2 id="settings-title">Your experience</h2>
          <label className="setting-row">
            Render quality
            <select
              value={auto ? "AUTO" : quality}
              onChange={(e) =>
                set(
                  e.target.value === "AUTO"
                    ? { autoQuality: true }
                    : {
                        autoQuality: false,
                        quality: e.target.value as Quality,
                      },
                )
              }
            >
              <option value="AUTO">Adaptive · {quality.toLowerCase()}</option>
              {["ULTRA", "HIGH", "MEDIUM", "LOW"].map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
          </label>
          <label className="setting-row">
            Still landscape
            <input
              type="checkbox"
              checked={flat}
              onChange={(e) => {
                set({ flat: e.target.checked, ready: e.target.checked });
                try {
                  localStorage.setItem(
                    "journey-display",
                    e.target.checked ? "still" : "world",
                  );
                } catch {
                  /* Optional preference. */
                }
              }}
            />
          </label>
          <label className="setting-row">
            Reduced motion
            <input
              type="checkbox"
              checked={reduced}
              onChange={(e) => set({ reducedMotion: e.target.checked })}
            />
          </label>
          <p className="settings-note">
            A quieter journey, at your own pace. All portfolio content is
            available in either display mode.
          </p>
        </div>
      </dialog>
      <ProjectPanel />
      <VehicleInteractions />
      <Cursor />
      <WebVitals />
      <DebugPanel />
    </div>
  );
}

function SoundToggle() {
  const sound = useExperience((s) => s.sound);
  const set = useExperience((s) => s.set);
  const context = useRef<AudioContext | null>(null);
  useEffect(
    () => () => {
      void context.current?.close();
    },
    [],
  );
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) void context.current?.suspend();
      else if (useExperience.getState().sound) void context.current?.resume();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);
  async function toggle() {
    try {
      if (!context.current) {
        const audio = new AudioContext();
        context.current = audio;
        const buffer = audio.createBuffer(
          1,
          audio.sampleRate * 4,
          audio.sampleRate,
        );
        const data = buffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < data.length; i++) {
          previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
          data[i] = previous * 3;
        }
        const noise = audio.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = audio.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 550;
        const gain = audio.createGain();
        gain.gain.value = 0.11;
        noise.connect(filter).connect(gain).connect(audio.destination);
        noise.start();
      }
      if (sound) await context.current.suspend();
      else await context.current.resume();
      set({ sound: !sound });
    } catch {
      set({ sound: false });
    }
  }
  return (
    <button
      className="hud-button"
      aria-label={`Sound ${sound ? "on" : "off"}`}
      aria-pressed={sound}
      onClick={toggle}
    >
      {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
      <span>Sound {sound ? "on" : "off"}</span>
    </button>
  );
}

function Cursor() {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      if (!cursor.current) return;
      cursor.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const target = (e.target as HTMLElement).closest?.(
        "button, a, [data-cursor]",
      );
      cursor.current.dataset.active = String(!!target);
      cursor.current.textContent = target?.getAttribute("data-cursor") ?? "";
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div ref={cursor} className="custom-cursor" aria-hidden="true" />;
}
