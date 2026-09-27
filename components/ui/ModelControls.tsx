"use client";
import { Crosshair, RotateCw, WandSparkles, MoveRight } from "lucide-react";
import { playModelAction, useExperience } from "@/stores/experience-store";

export default function ModelControls() {
  const phase = useExperience((s) => s.phase);
  const action = useExperience((s) => s.action);
  const auto = useExperience((s) => s.autoActions);
  const loading = useExperience((s) => s.modelsLoading);
  const ready = useExperience((s) => s.ready);
  const reduced = useExperience((s) => s.reducedMotion);
  const set = useExperience((s) => s.set);
  const ship = phase === "COMBAT_TRANSITION";
  return (
    <div
      className="model-controls"
      aria-label="3D model actions"
      role="group"
      data-action={action?.kind ?? "idle"}
    >
      <div className="model-action-buttons">
        <button
          disabled={!ready || loading || reduced || !!action}
          onClick={() => playModelAction(ship ? "fire" : "cast")}
        >
          {ship ? <Crosshair size={13} /> : <WandSparkles size={13} />}
          {ship ? "Fire cannons" : "Cast spell"}
        </button>
        <button
          disabled={!ready || loading || reduced || !!action}
          onClick={() => playModelAction(ship ? "roll" : "dodge")}
        >
          {ship ? <RotateCw size={13} /> : <MoveRight size={13} />}
          {ship ? "Barrel roll" : "Phase dodge"}
        </button>
      </div>
      <button
        className="model-autoplay"
        aria-pressed={auto}
        disabled={reduced}
        onClick={() => set({ autoActions: !auto })}
      >
        <span className={auto ? "live-dot" : "paused-dot"} /> Auto actions{" "}
        {auto ? "on" : "off"}
      </button>
      {reduced && (
        <span className="action-note">Actions paused by reduced motion</span>
      )}
    </div>
  );
}
