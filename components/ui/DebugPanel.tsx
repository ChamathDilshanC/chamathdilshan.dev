"use client";
import { useEffect, useState } from "react";
import { actions } from "@/animation/character-animations";
import {
  journey,
  qualitySettings,
  useExperience,
} from "@/stores/experience-store";

export default function DebugPanel() {
  const [visible, setVisible] = useState(false);
  const [sample, setSample] = useState("");
  const quality = useExperience((s) => s.quality);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(
      () =>
        setSample(
          JSON.stringify(
            {
              fps: journey.fps,
              cpuRenderMs: Number(journey.cpuMs.toFixed(2)),
              gpuMs: journey.gpuMs,
              calls: journey.calls,
              triangles: journey.triangles,
              textures: journey.textures,
              geometries: journey.geometries,
              camera: journey.camera.map((n) => +n.toFixed(2)),
              target: journey.target.map((n) => +n.toFixed(2)),
              fov: +journey.fov.toFixed(1),
              scroll: +journey.progress.toFixed(3),
              animation: journey.animation,
              quality,
              particles: qualitySettings[quality].leaves,
            },
            null,
            2,
          ),
        ),
      500,
    );
    return () => clearInterval(timer);
  }, [visible, quality]);
  if (!visible) return null;
  return (
    <aside className="debug-panel" aria-label="Development instrumentation">
      <strong>Scene instrumentation · F2</strong>
      <pre>{sample}</pre>
      {(["cameraOffset", "targetOffset"] as const).map((kind) => (
        <div key={kind}>
          {["X", "Y", "Z"].map((axis, i) => (
            <label key={axis}>
              {kind === "cameraOffset" ? "Camera" : "Target"} {axis}
              <input
                type="range"
                min="-15"
                max="15"
                step=".1"
                defaultValue="0"
                onChange={(e) => {
                  journey.debug[kind][i] = +e.target.value;
                }}
              />
            </label>
          ))}
        </div>
      ))}
      <label>
        Fog
        <input
          type="range"
          min="0"
          max="0.03"
          step="0.001"
          defaultValue={journey.debug.fog}
          onChange={(e) => {
            journey.debug.fog = +e.target.value;
          }}
        />
      </label>
      <label>
        Sun
        <input
          type="range"
          min="0"
          max="6"
          step="0.1"
          defaultValue={journey.debug.light}
          onChange={(e) => {
            journey.debug.light = +e.target.value;
          }}
        />
      </label>
      <label>
        FOV (0 = authored)
        <input
          type="range"
          min="0"
          max="80"
          defaultValue={0}
          onChange={(e) => {
            journey.debug.fov = +e.target.value;
          }}
        />
      </label>
      <label>
        Animation
        <select
          onChange={(e) => {
            journey.debug.animation = e.target.value;
          }}
        >
          <option>Auto</option>
          {actions.map((action) => (
            <option key={action}>{action}</option>
          ))}
        </select>
      </label>
    </aside>
  );
}
