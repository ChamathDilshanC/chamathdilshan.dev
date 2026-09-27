"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { Gate, Lantern } from "@/components/environment/Landscape";
import { journey, useExperience } from "@/stores/experience-store";
export default function LaterChapters() {
  const chapter = useExperience((s) => s.chapter);
  const skill = useExperience((s) => s.skill);
  const fire = useRef<Mesh>(null);
  useFrame(() => {
    if (fire.current)
      fire.current.scale.y = useExperience.getState().reducedMotion
        ? 1
        : 1 + Math.sin(journey.time * 6) * 0.15;
  });
  return (
    <>
      {chapter === 2 && (
        <group position={[0, 0, -48]}>
          {Array.from({ length: 6 }, (_, i) => (
            <group
              key={i}
              position={[(i % 2 ? 1 : -1) * 4, 0, -Math.floor(i / 2) * 5]}
            >
              <Lantern
                position={[0, 0, 0]}
                active={skill === i}
                onClick={() => useExperience.getState().set({ skill: i })}
              />
              <mesh position={[0, -0.02, 0]}>
                <cylinderGeometry args={[1.1, 1.3, 0.16, 8]} />
                <meshStandardMaterial color="#737865" />
              </mesh>
            </group>
          ))}
          <Gate position={[0, 0, -11]} scale={0.8} />
        </group>
      )}
      {chapter === 3 && (
        <group position={[0, 0, -58]}>
          {[0, 1, 2].map((i) => (
            <group key={i} position={[-3.4, 0, -i * 4]}>
              <mesh position={[0, 0.9, 0]} rotation={[0, -0.18, 0]}>
                <boxGeometry args={[1.2, 1.8, 0.4]} />
                <meshStandardMaterial color="#747665" roughness={1} />
              </mesh>
              <Lantern position={[1.2, 0, 0]} active />
            </group>
          ))}
        </group>
      )}
      {chapter === 4 && (
        <group position={[2, 0, -68]}>
          <mesh ref={fire} position={[0, 0.35, 0]}>
            <coneGeometry args={[0.25, 0.75, 7]} />
            <meshStandardMaterial
              color="#e8a33f"
              emissive="#f57b20"
              emissiveIntensity={2}
            />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh
              key={i}
              position={[Math.cos(i) * 0.55, 0.12, Math.sin(i) * 0.55]}
              scale={[0.25, 0.16, 0.23]}
            >
              <dodecahedronGeometry />
              <meshStandardMaterial color="#707366" />
            </mesh>
          ))}
          <pointLight
            position={[0, 1, 0]}
            color="#ffc370"
            intensity={4}
            distance={7}
          />
        </group>
      )}
      {chapter === 5 && (
        <group position={[0, 0, -82]}>
          <Gate position={[0, 0, -4]} scale={1.2} />
          <Lantern position={[-3, 0, -4]} active />
          <Lantern position={[3, 0, -4]} active />
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[7, 8, 0.2, 12]} />
            <meshStandardMaterial color="#696e59" />
          </mesh>
        </group>
      )}
    </>
  );
}
