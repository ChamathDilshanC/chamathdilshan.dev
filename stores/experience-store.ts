import { create } from "zustand";
import type { VehicleId } from "@/config/vehicles";
import {
  actorAt,
  type Actor,
  type ModelAction,
  type ActionRequest,
} from "@/animation/model-actions";

export type Quality = "ULTRA" | "HIGH" | "MEDIUM" | "LOW";
export type ExperienceState =
  | "LOADING"
  | "INTRO"
  | "WALKING"
  | "PROJECT_VIEW"
  | "COMBAT_TRANSITION"
  | "SKILLS"
  | "EXPERIENCE"
  | "ABOUT"
  | "CONTACT"
  | "EXPLORE";
export const qualitySettings = {
  ULTRA: {
    dpr: 2,
    leaves: 160,
    grass: 1800,
    shadows: true,
    shadowSize: 2048,
  },
  HIGH: {
    dpr: 1.5,
    leaves: 100,
    grass: 1200,
    shadows: true,
    shadowSize: 1024,
  },
  MEDIUM: { dpr: 1, leaves: 55, grass: 650, shadows: false, shadowSize: 512 },
  LOW: { dpr: 1, leaves: 24, grass: 280, shadows: false, shadowSize: 256 },
};
export const journey = {
  progress: 0,
  visualProgress: 0,
  requestFrame: null as (() => void) | null,
  time: 0,
  pointer: { x: 0, y: 0 },
  fps: 0,
  cpuMs: 0,
  gpuMs: null as number | null,
  calls: 0,
  triangles: 0,
  textures: 0,
  geometries: 0,
  camera: [0, 0, 0],
  target: [0, 0, 0],
  fov: 42,
  animation: "Idle",
  explore: { x: 0, z: 0, yaw: 0, moving: false, sprint: false, dodge: 0 },
  debug: {
    fog: 0.008,
    light: 4.5,
    fov: 0,
    animation: "Auto",
    cameraOffset: [0, 0, 0],
    targetOffset: [0, 0, 0],
  },
};
type Store = {
  annotation: number | null;
  driving: boolean;
  selectedVehicle: VehicleId;
  activeVehicle: VehicleId;
  chapter: number;
  phase: ExperienceState;
  project: string | null;
  skill: number;
  quality: Quality;
  autoQuality: boolean;
  reducedMotion: boolean;
  flat: boolean;
  ready: boolean;
  modelsLoading: boolean;
  modelProgress: number;
  modelError: boolean;
  action: ActionRequest | null;
  autoActions: boolean;
  sound: boolean;
  explore: boolean;
  set: (patch: Partial<Omit<Store, "set">>) => void;
};
export const useExperience = create<Store>((set) => ({
  annotation: null,
  driving: false,
  selectedVehicle: "fighter",
  activeVehicle: "fighter",
  chapter: 0,
  phase: "LOADING",
  project: null,
  skill: 0,
  quality: "HIGH",
  autoQuality: true,
  reducedMotion: false,
  flat: false,
  ready: false,
  modelsLoading: false,
  modelProgress: 0,
  modelError: false,
  action: null,
  autoActions: true,
  sound: false,
  explore: false,
  set: (patch) => set(patch),
}));

let actionId = 0;
export function playModelAction(
  kind: ModelAction,
  actor: Actor = actorAt(journey.progress),
) {
  const state = useExperience.getState();
  if (state.reducedMotion || state.flat || state.project || state.action)
    return;
  const request = { actor, kind, started: journey.time, id: ++actionId };
  state.set({ action: request });
  performance.clearMarks("portfolio:action");
  performance.mark("portfolio:action", { detail: request });
  journey.requestFrame?.();
}
