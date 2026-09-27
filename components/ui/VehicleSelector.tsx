"use client";
import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { isVehicleId, vehicleById, vehicles } from "@/config/vehicles";
import { useExperience } from "@/stores/experience-store";
import {
  annotationsFor,
  resetVehicleMovement,
} from "@/lib/vehicle-interaction";

export default function VehicleSelector() {
  const selected = useExperience((s) => s.selectedVehicle);
  const active = useExperience((s) => s.activeVehicle);
  const error = useExperience((s) => s.modelError);
  const flat = useExperience((s) => s.flat);
  const set = useExperience((s) => s.set);
  const model = vehicleById(selected);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio-vehicle");
      if (isVehicleId(saved)) set({ selectedVehicle: saved });
    } catch {
      /* Preference storage is optional. */
    }
  }, [set]);
  return (
    <div className="vehicle-selector">
      <label className="vehicle-picker">
        <span>CHOOSE YOUR RIDE</span>
        <select
          aria-label="Choose your vehicle"
          value={selected}
          onChange={(event) => {
            const id = event.target.value;
            if (!isVehicleId(id)) return;
            resetVehicleMovement();
            set({
              annotation: null,
              driving: false,
              selectedVehicle: id,
              modelError: false,
              action: null,
              flat: false,
            });
            try {
              localStorage.setItem("portfolio-vehicle", id);
            } catch {
              /* Optional. */
            }
          }}
        >
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.label}
            </option>
          ))}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </label>
      <div className="vehicle-meta">
        <span role="status" aria-live="polite">
          {error
            ? "Model unavailable. Choose another ride."
            : selected !== active
              ? `Loading ${model.label}…`
              : "Your journey, your ride."}
        </span>
        <details>
          <summary>Model details</summary>
          <div className="vehicle-credit">
            <strong>{model.title}</strong>
            <p>3D model by {model.author}.</p>
            <a href={model.source} target="_blank" rel="noreferrer">
              View original on Sketchfab ↗
            </a>
            <a href={model.licenseUrl} target="_blank" rel="noreferrer">
              {model.license}
            </a>
            <small>
              Optimized for this experience; scroll animation added.
            </small>
          </div>
        </details>
      </div>
      {!flat && selected === active && (
        <div className="vehicle-interact-actions">
          <button
            onClick={() =>
              set({
                driving: true,
                annotation: null,
                action: null,
                explore: false,
              })
            }
          >
            Move · arrow keys
          </button>
          {annotationsFor(active).length > 0 && (
            <button
              onClick={() =>
                set({ annotation: 0, driving: false, action: null })
              }
            >
              {annotationsFor(active).length} annotations
            </button>
          )}
        </div>
      )}
    </div>
  );
}
