"use client";
import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PointLight,
} from "three";
import type { Actor, actionPose } from "@/animation/model-actions";
import { journey, useExperience } from "@/stores/experience-store";

export default function ActionEffects({
  actor,
  pose,
}: {
  actor: Actor;
  pose: RefObject<ReturnType<typeof actionPose>>;
}) {
  const root = useRef<Group>(null);
  const orb = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const staffLight = useRef<PointLight>(null);
  const wave = useRef<Mesh>(null);
  const bolts = useRef<Group>(null);
  const jets = useRef<Group>(null);
  const ship = actor === "fighter";
  const color = actor === "necromancer" ? "#b9ff83" : "#9be8ff";
  const origin: [number, number, number] =
    actor === "necromancer" ? [0, 4.05, 1] : [-0.95, 4.12, 0.2];
  useFrame(() => {
    if (!root.current) return;
    root.current.visible = !useExperience.getState().reducedMotion;
    const frame = pose.current;
    const t = journey.time;
    if (orb.current && halo.current) {
      orb.current.scale.setScalar(0.035 + frame.charge * 0.1);
      halo.current.scale.setScalar(0.12 + frame.charge * 0.3);
      if (staffLight.current)
        staffLight.current.intensity = 0.5 + frame.charge * 7;
      halo.current.rotation.set(t * 0.6, t * 0.9, 0);
      (halo.current.material as MeshBasicMaterial).opacity =
        0.18 + frame.charge * 0.6;
    }
    if (wave.current) {
      const visible = frame.release > 0 && frame.release < 1;
      wave.current.visible = visible;
      wave.current.scale.setScalar(0.3 + frame.release * 4.5);
      (wave.current.material as MeshBasicMaterial).opacity =
        (1 - frame.release) * 0.65;
    }
    if (jets.current) {
      jets.current.scale.z = 1 + Math.sin(t * 17) * 0.09 + frame.y * 0.7;
    }
    if (bolts.current) {
      bolts.current.visible = frame.fire > 0;
      bolts.current.children.forEach((bolt, i) => {
        const travel = (t * 2.4 + Math.floor(i / 2) * 0.25) % 1;
        bolt.position.z = 2.1 + travel * 9;
        bolt.scale.setScalar(1 - travel * 0.5);
      });
    }
  });
  return (
    <group ref={root}>
      {ship ? (
        <>
          <group ref={jets}>
            {[-0.85, 0.85].map((x) => (
              <group key={x} position={[x, 1.3, -1.8]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <coneGeometry args={[0.2, 1.7, 12]} />
                  <meshBasicMaterial
                    color="#54d9ff"
                    transparent
                    opacity={0.5}
                    blending={AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </mesh>
                <mesh position={[0, 0, 0.2]}>
                  <sphereGeometry args={[0.12, 12, 8]} />
                  <meshBasicMaterial color="#ddfaff" toneMapped={false} />
                </mesh>
              </group>
            ))}
          </group>
          <group ref={bolts} visible={false}>
            {Array.from({ length: 8 }, (_, i) => (
              <mesh
                key={i}
                position={[i % 2 ? 0.85 : -0.85, 0.6, 2.1]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.025, 0.025, 0.85, 6]} />
                <meshBasicMaterial
                  color="#9ff6ff"
                  toneMapped={false}
                  blending={AdditiveBlending}
                  transparent
                  opacity={0.85}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        </>
      ) : (
        <>
          <group position={origin}>
            <pointLight
              ref={staffLight}
              color={color}
              intensity={0.5}
              distance={4}
              decay={2}
            />
            <mesh ref={orb}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            <mesh ref={halo}>
              <torusGeometry args={[1, 0.04, 6, 48]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.4}
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
          <mesh
            ref={wave}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.12, 0]}
            visible={false}
          >
            <ringGeometry args={[0.93, 1, 80]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0}
              side={DoubleSide}
              blending={AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
