"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import type { VehicleId } from "@/config/vehicles";
import { annotationsFor, vehicleInteraction } from "@/lib/vehicle-interaction";
import { useExperience } from "@/stores/experience-store";

export default function VehicleAnnotations({
  name,
  offset,
}: {
  name: VehicleId;
  offset: [number, number, number];
}) {
  const anchor = useRef<Group>(null);
  const points = useMemo(
    () =>
      annotationsFor(name).map((point) => ({
        position: new Vector3().fromArray(point.position),
        eye: new Vector3().fromArray(point.eye),
        target: new Vector3().fromArray(point.target),
        x: 0,
        y: 0,
        anchorX: 0,
        anchorY: 0,
        visible: false,
      })),
    [name],
  );
  const projected = useRef(new Vector3());
  useFrame(({ camera, size, invalidate }) => {
    if (!anchor.current) return;
    anchor.current.updateWorldMatrix(true, false);
    const state = useExperience.getState();
    points.forEach((point, index) => {
      const marker = vehicleInteraction.markers.get(index);
      if (marker) {
        const p = projected.current.copy(point.position);
        anchor.current!.localToWorld(p).project(camera);
        point.visible =
          p.z > -1 && p.z < 1 && Math.abs(p.x) < 0.96 && Math.abs(p.y) < 0.92;
        point.x = point.anchorX = ((p.x + 1) * size.width) / 2;
        point.y = point.anchorY = ((1 - p.y) * size.height) / 2;
      }
      if (state.annotation === index) {
        const changed =
          vehicleInteraction.focusVehicle !== name ||
          vehicleInteraction.focusIndex !== index;
        anchor.current!.localToWorld(vehicleInteraction.eye.copy(point.eye));
        anchor.current!.localToWorld(
          vehicleInteraction.target.copy(point.target),
        );
        vehicleInteraction.focusVehicle = name;
        vehicleInteraction.focusIndex = index;
        if (changed) invalidate();
      }
    });
    // Keep small-screen touch targets separate while leader lines retain the
    // exact authored anchor on the moving surface.
    const gap = size.width < 760 ? 38 : 34;
    for (let pass = 0; pass < 12; pass++) {
      for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
          const p = points[a]!,
            q = points[b]!;
          if (!p.visible || !q.visible) continue;
          const dx = q.x - p.x,
            dy = q.y - p.y;
          const distance = Math.hypot(dx, dy);
          if (distance >= gap) continue;
          const nx = distance > 0.01 ? dx / distance : 1;
          const ny = distance > 0.01 ? dy / distance : 0;
          const push = (gap - distance) / 2;
          p.x -= nx * push;
          p.y -= ny * push;
          q.x += nx * push;
          q.y += ny * push;
        }
      }
    }
    points.forEach((point, index) => {
      const marker = vehicleInteraction.markers.get(index);
      if (!marker) return;
      point.x = Math.max(20, Math.min(size.width - 20, point.x));
      point.y = Math.max(78, Math.min(size.height - 24, point.y));
      marker.style.visibility = point.visible ? "visible" : "hidden";
      marker.style.transform = `translate(-50%, -50%) translate(${point.x}px, ${point.y}px)`;
      const leader = vehicleInteraction.leaders.get(index);
      if (leader) {
        leader.style.visibility =
          point.visible &&
          Math.hypot(point.x - point.anchorX, point.y - point.anchorY) > 8
            ? "visible"
            : "hidden";
        leader.setAttribute("x1", String(point.anchorX));
        leader.setAttribute("y1", String(point.anchorY));
        leader.setAttribute("x2", String(point.x));
        leader.setAttribute("y2", String(point.y));
      }
    });
  });
  return <group ref={anchor} position={offset} />;
}
