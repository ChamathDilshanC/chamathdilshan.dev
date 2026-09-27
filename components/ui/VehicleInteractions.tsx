"use client";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, X } from "lucide-react";
import { annotationsFor, vehicleInteraction } from "@/lib/vehicle-interaction";
import { journey, useExperience } from "@/stores/experience-store";
import { vehicleById } from "@/config/vehicles";

const directions = [
  ["ArrowUp", "Move forward", ArrowUp],
  ["ArrowLeft", "Move left", ArrowLeft],
  ["ArrowDown", "Move backward", ArrowDown],
  ["ArrowRight", "Move right", ArrowRight],
] as const;

export default function VehicleInteractions() {
  const active = useExperience((s) => s.activeVehicle);
  const annotation = useExperience((s) => s.annotation);
  const driving = useExperience((s) => s.driving);
  const flat = useExperience((s) => s.flat);
  const set = useExperience((s) => s.set);
  const closeButton = useRef<HTMLButtonElement>(null);
  const points = annotationsFor(active);
  const point = annotation === null ? null : points[annotation];
  const engaged = driving || !!point;

  useEffect(() => {
    if (!engaged || flat) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    const clear = () => vehicleInteraction.held.clear();
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest(
          "input, textarea, select, [contenteditable=true], dialog",
        )
      )
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        set({ annotation: null, driving: false });
      }
      if (driving && directions.some(([key]) => key === event.key)) {
        event.preventDefault();
        vehicleInteraction.held.add(event.key);
        journey.requestFrame?.();
      }
    };
    const keyup = (event: KeyboardEvent) =>
      vehicleInteraction.held.delete(event.key);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      clear();
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [engaged, driving, flat, set]);

  if (flat) return null;
  const close = () => set({ annotation: null, driving: false });
  return (
    <>
      <div
        className="vehicle-annotations"
        aria-label={`${vehicleById(active).label} annotations`}
      >
        <svg className="vehicle-annotation-leaders" aria-hidden="true">
          {points.map((item, index) => (
            <line
              key={`${active}-${item.id}`}
              ref={(element) => {
                if (element) vehicleInteraction.leaders.set(index, element);
                else vehicleInteraction.leaders.delete(index);
              }}
            />
          ))}
        </svg>
        {points.map((item, index) => (
          <button
            key={`${active}-${item.id}`}
            ref={(element) => {
              if (element) vehicleInteraction.markers.set(index, element);
              else vehicleInteraction.markers.delete(index);
            }}
            className="vehicle-annotation-marker"
            aria-label={`Annotation ${index + 1}: ${item.title}`}
            aria-pressed={annotation === index}
            title={item.title}
            onClick={() =>
              set({ annotation: index, driving: false, action: null })
            }
          >
            {index + 1}
          </button>
        ))}
      </div>
      {point && (
        <section
          className="vehicle-inspection-panel"
          aria-label="Model annotation"
          data-lenis-prevent
        >
          <div className="vehicle-inspection-heading">
            <span>
              {vehicleById(active).label} · {annotation! + 1} / {points.length}
            </span>
            <button
              ref={closeButton}
              onClick={close}
              aria-label="Close annotation"
            >
              <X size={19} />
            </button>
          </div>
          <div aria-live="polite">
            <h2>{point.title}</h2>
            {point.body && <p>{point.body}</p>}
          </div>
          <nav aria-label="Model annotations">
            <button
              aria-label="Previous annotation"
              onClick={() =>
                set({
                  annotation: (annotation! + points.length - 1) % points.length,
                })
              }
            >
              <ArrowLeft size={16} />
            </button>
            <span>Original model annotations</span>
            <button
              aria-label="Next annotation"
              onClick={() =>
                set({ annotation: (annotation! + 1) % points.length })
              }
            >
              <ArrowRight size={16} />
            </button>
          </nav>
        </section>
      )}
      {driving && (
        <section
          className="vehicle-drive-panel"
          aria-label="Vehicle movement controls"
          data-lenis-prevent
        >
          <div className="vehicle-inspection-heading">
            <strong>Move your {vehicleById(active).label}</strong>
            <button ref={closeButton} onClick={close} aria-label="Stop driving">
              <X size={19} />
            </button>
          </div>
          <p>Use arrow keys or hold a direction. Esc returns to the journey.</p>
          <div className="vehicle-direction-pad">
            {directions.map(([key, label, Icon]) => (
              <button
                key={key}
                aria-label={label}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  vehicleInteraction.held.add(key);
                  journey.requestFrame?.();
                }}
                onPointerUp={() => vehicleInteraction.held.delete(key)}
                onPointerCancel={() => vehicleInteraction.held.delete(key)}
                onLostPointerCapture={() => vehicleInteraction.held.delete(key)}
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    vehicleInteraction.held.add(key);
                  }
                }}
                onKeyUp={() => vehicleInteraction.held.delete(key)}
                onBlur={() => vehicleInteraction.held.delete(key)}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
          <button
            className="vehicle-drive-reset"
            onClick={() => {
              vehicleInteraction.held.clear();
              vehicleInteraction.x = vehicleInteraction.z = 0;
              vehicleInteraction.vx = vehicleInteraction.vz = 0;
              journey.requestFrame?.();
            }}
          >
            Reset position
          </button>
        </section>
      )}
    </>
  );
}
