"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, InstancedMesh, Object3D, Color } from "three";
import {
  journey,
  qualitySettings,
  useExperience,
} from "@/stores/experience-store";
import { seeded } from "@/components/environment/Landscape";

export default function Leaves() {
  const mesh = useRef<InstancedMesh>(null);
  const quality = useExperience((s) => s.quality);
  const count = qualitySettings[quality].leaves;
  const data = useMemo(() => {
    const random = seeded(451);
    return Array.from({ length: count }, () => ({
      x: random() * 32 - 16,
      y: random() * 16,
      z: random() * 38 - 20,
      size: 0.04 + random() * 0.095,
      speed: 0.3 + random() * 0.6,
    }));
  }, [count]);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  useFrame(({ camera }) => {
    if (!mesh.current) return;
    const t = useExperience.getState().reducedMotion ? 0 : journey.time;
    const combat = journey.progress > 0.35 && journey.progress < 0.55;
    data.forEach((leaf, i) => {
      dummy.position.set(
        leaf.x + Math.sin(t * 0.2 + i) * 3 + journey.pointer.x * 0.5,
        ((leaf.y - t * leaf.speed * (combat ? 1.8 : 1)) % 16) +
          (leaf.y - t * leaf.speed < 0 ? 16 : 0),
        camera.position.z + leaf.z - 12,
      );
      dummy.rotation.set(t * leaf.speed, i + t * 0.4, t * 0.3 + i);
      dummy.scale.set(leaf.size, leaf.size * 1.6, leaf.size);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      color.set(i % 3 === 0 ? "#b6572d" : "#cda049");
      mesh.current!.setColorAt(i, color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <circleGeometry args={[1, 5]} />
      <meshStandardMaterial side={DoubleSide} roughness={0.9} />
    </instancedMesh>
  );
}
