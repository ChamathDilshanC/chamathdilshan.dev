import { Vector3 } from "three";
import annotations from "@/config/vehicle-annotations.json";
import type { VehicleId } from "@/config/vehicles";

export type VehicleAnnotation = {
  id: string;
  title: string;
  body: string;
  position: number[];
  eye: number[];
  target: number[];
};
export const annotationsFor = (id: VehicleId): VehicleAnnotation[] =>
  annotations[id];
// Frame data stays outside React so moving a model never rerenders the page.
export const vehicleInteraction = {
  markers: new Map<number, HTMLButtonElement>(),
  leaders: new Map<number, SVGLineElement>(),
  held: new Set<string>(),
  x: 0,
  z: 0,
  vx: 0,
  vz: 0,
  focusVehicle: null as VehicleId | null,
  focusIndex: null as number | null,
  eye: new Vector3(),
  target: new Vector3(),
};
export function resetVehicleMovement() {
  vehicleInteraction.held.clear();
  vehicleInteraction.x = vehicleInteraction.z = 0;
  vehicleInteraction.vx = vehicleInteraction.vz = 0;
  vehicleInteraction.focusVehicle = null;
  vehicleInteraction.focusIndex = null;
}
