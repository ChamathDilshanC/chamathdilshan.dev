"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Color,
  InstancedMesh,
  Object3D,
  DoubleSide,
  Mesh,
  Group,
} from "three";
import {
  journey,
  qualitySettings,
  useExperience,
} from "@/stores/experience-store";
import { portfolio } from "@/config/portfolio";

export function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function Mountain({
  x,
  z,
  width,
  height,
  color,
  seed,
}: {
  x: number;
  z: number;
  width: number;
  height: number;
  color: string;
  seed: number;
}) {
  const geometry = useMemo(() => {
    const random = seeded(seed);
    const vertices: number[] = [];
    const colors: number[] = [];
    const rings = 18;
    const segments = 64;
    const points: number[][] = [];
    for (let r = 0; r <= rings; r++) {
      for (let s = 0; s <= segments; s++) {
        const angle = (s / segments) * Math.PI * 2;
        const radius = r / rings;
        const ridge =
          Math.sin(angle * 7 + radius * 3) * 0.08 + Math.cos(angle * 11) * 0.04;
        points.push([
          Math.cos(angle) * radius * width,
          Math.pow(1 - radius, 1.55) * height +
            (random() - 0.5) * radius * 2.2 +
            ridge * radius * height,
          Math.sin(angle) * radius * width * 0.65,
        ]);
      }
    }
    const base = new Color(color);
    const snow = new Color("#d4d5c6");
    const add = (i: number) => {
      const p = points[i]!;
      vertices.push(...p);
      const c = base
        .clone()
        .lerp(
          snow,
          p[1]! > height * 0.65
            ? Math.min(0.8, (p[1]! / height - 0.65) * 2.2)
            : 0,
        );
      c.multiplyScalar(0.86 + random() * 0.22);
      colors.push(c.r, c.g, c.b);
    };
    for (let r = 0; r < rings; r++)
      for (let s = 0; s < segments; s++) {
        const a = r * (segments + 1) + s;
        const b = a + segments + 1;
        [a, b, a + 1, b, b + 1, a + 1].forEach(add);
      }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    g.setAttribute("color", new Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [seed, color, width, height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} position={[x, -6, z]}>
      <meshStandardMaterial
        vertexColors
        roughness={1}
        flatShading
        side={DoubleSide}
      />
    </mesh>
  );
}

function Trees() {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);
  const quality = useExperience((s) => s.quality);
  const count = quality === "LOW" ? 45 : quality === "MEDIUM" ? 75 : 120;
  useEffect(() => {
    if (!trunks.current || !crowns.current) return;
    const random = seeded(94);
    const dummy = new Object3D();
    const tint = new Color();
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side * (10 + random() * 34);
      const z = -10 - random() * 115;
      const height = 3 + random() * 7;
      dummy.position.set(x, height / 2 - 0.15, z);
      dummy.rotation.set(0, random() * 6, (random() - 0.5) * 0.14);
      dummy.scale.set(0.2 + random() * 0.3, height, 0.24);
      dummy.updateMatrix();
      trunks.current.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 65; j++) {
        const angle = random() * Math.PI * 2;
        const radius = Math.sqrt(random()) * 3.4;
        dummy.position.set(
          x + Math.cos(angle) * radius,
          height * 0.85 + (random() - 0.5) * 2.4 - radius * 0.18,
          z + Math.sin(angle) * radius,
        );
        const size = 0.28 + random() * 0.52;
        dummy.scale.set(size * 1.5, size * 0.6, size);
        dummy.rotation.set(random(), random() * 6, random());
        dummy.updateMatrix();
        crowns.current.setMatrixAt(i * 65 + j, dummy.matrix);
        tint.set(
          ["#85512b", "#9d7033", "#b29446", "#6b7439", "#793c28"][
            Math.floor(random() * 5)
          ]!,
        );
        crowns.current.setColorAt(i * 65 + j, tint);
      }
    }
    trunks.current.instanceMatrix.needsUpdate = true;
    crowns.current.instanceMatrix.needsUpdate = true;
    if (crowns.current.instanceColor)
      crowns.current.instanceColor.needsUpdate = true;
  }, [count]);
  useFrame(() => {
    if (crowns.current && !useExperience.getState().reducedMotion)
      crowns.current.rotation.z = Math.sin(journey.time * 0.35) * 0.002;
  });
  return (
    <>
      <instancedMesh
        ref={trunks}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.65, 1, 1, 6]} />
        <meshStandardMaterial color="#303830" roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={crowns}
        args={[undefined, undefined, count * 65]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
    </>
  );
}

function Grass() {
  const mesh = useRef<InstancedMesh>(null);
  const quality = useExperience((s) => s.quality);
  const count = qualitySettings[quality].grass;
  const data = useMemo(() => {
    const random = seeded(543);
    return Array.from({ length: count }, () => ({
      x: (random() - 0.5) * 42,
      z: 18 - random() * 118,
      h: 0.25 + random() * 0.8,
      turn: random() * 6,
    }));
  }, [count]);
  const dummy = useMemo(() => new Object3D(), []);
  useFrame(() => {
    if (!mesh.current) return;
    const t = useExperience.getState().reducedMotion ? 0 : journey.time;
    data.forEach((blade, i) => {
      const near =
        Math.abs(blade.z + journey.progress * 80) < 1.5 &&
        Math.abs(blade.x) < 2;
      dummy.position.set(blade.x, blade.h / 2 - 0.12, blade.z);
      dummy.rotation.set(
        0.1,
        blade.turn,
        Math.sin(t * 1.3 + blade.x + blade.z) * 0.16 + (near ? 0.6 : 0),
      );
      dummy.scale.set(0.035, blade.h, 0.035);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <coneGeometry args={[1, 1, 3]} />
      <meshStandardMaterial color="#8e8c56" roughness={1} />
    </instancedMesh>
  );
}

export function Lantern({
  position,
  active = false,
  onClick,
}: {
  position: [number, number, number];
  active?: boolean;
  onClick?: () => void;
}) {
  const light = useRef<Mesh>(null);
  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => {
        if (light.current) light.current.scale.setScalar(1.12);
      }}
      onPointerOut={() => light.current?.scale.setScalar(1)}
    >
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.15, 0.23, 0.9, 6]} />
        <meshStandardMaterial color="#575b4c" />
      </mesh>
      <mesh ref={light} position={[0, 1.1, 0]}>
        <boxGeometry args={[0.42, 0.48, 0.42]} />
        <meshStandardMaterial
          color="#eacb87"
          emissive="#ffb54f"
          emissiveIntensity={active ? 2 : 0.5}
        />
      </mesh>
      <mesh position={[0, 1.43, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.48, 0.26, 4]} />
        <meshStandardMaterial color="#353e33" />
      </mesh>
      <mesh position={[0, 0.83, 0]}>
        <boxGeometry args={[0.65, 0.12, 0.65]} />
        <meshStandardMaterial color="#494e40" />
      </mesh>
    </group>
  );
}

export function Gate({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 2.1, 2.2, 0]}
          rotation={[0, 0, side * -0.035]}
          castShadow
        >
          <cylinderGeometry args={[0.17, 0.22, 4.4, 8]} />
          <meshStandardMaterial color="#663e2a" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 4.45, 0]} castShadow>
        <boxGeometry args={[5.7, 0.26, 0.42]} />
        <meshStandardMaterial color="#303a30" />
      </mesh>
      <mesh position={[0, 3.75, 0]}>
        <boxGeometry args={[4.9, 0.18, 0.25]} />
        <meshStandardMaterial color="#724b32" />
      </mesh>
      <mesh position={[0, 4.08, 0]}>
        <boxGeometry args={[0.15, 0.7, 0.22]} />
        <meshStandardMaterial color="#9e8050" />
      </mesh>
    </group>
  );
}

export function ProjectShrine() {
  const chapter = useExperience((s) => s.chapter);
  const set = useExperience((s) => s.set);
  return (
    <group position={[0, 0, -22]} visible={chapter < 3}>
      <Gate position={[0, 0, -3]} />
      {portfolio.projects.map((p, i) => (
        <Lantern
          key={p.id}
          position={[(i % 2 ? 1 : -1) * (3.5 + Math.floor(i / 2)), 0, -i * 2]}
          active={chapter === 1}
          onClick={() => set({ project: p.id, phase: "PROJECT_VIEW" })}
        />
      ))}
      <mesh position={[0, -0.02, -3]} receiveShadow>
        <boxGeometry args={[6.6, 0.15, 5]} />
        <meshStandardMaterial color="#666958" roughness={1} />
      </mesh>
    </group>
  );
}

export default function Landscape() {
  const fog = useRef<Group>(null);
  useFrame(() => {
    if (fog.current && !useExperience.getState().reducedMotion)
      fog.current.position.x = Math.sin(journey.time * 0.06) * 3;
  });
  return (
    <>
      <Mountain
        x={-12}
        z={-160}
        width={67}
        height={48}
        color="#758478"
        seed={41}
      />
      <Mountain
        x={-65}
        z={-137}
        width={58}
        height={31}
        color="#596e62"
        seed={67}
      />
      <Mountain
        x={65}
        z={-142}
        width={65}
        height={38}
        color="#68786a"
        seed={29}
      />
      <Mountain
        x={-45}
        z={-86}
        width={30}
        height={19}
        color="#384d40"
        seed={14}
      />
      <Mountain
        x={48}
        z={-96}
        width={35}
        height={24}
        color="#475d48"
        seed={81}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.17, -45]}
        receiveShadow
      >
        <planeGeometry args={[170, 210]} />
        <meshStandardMaterial color="#3e4933" roughness={1} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.145, -42]}
        receiveShadow
      >
        <planeGeometry args={[4.5, 130]} />
        <meshStandardMaterial color="#79755b" roughness={1} />
      </mesh>
      <Trees />
      <Grass />
      <ProjectShrine />
      <group ref={fog}>
        {[-30, -65, -105].map((z, i) => (
          <mesh
            key={z}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.15 + i * 0.1, z]}
          >
            <planeGeometry args={[130, 24]} />
            <meshBasicMaterial
              color="#b3b7a1"
              transparent
              opacity={0.065}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[-46, 48, -170]}>
        <sphereGeometry args={[5, 24, 24]} />
        <meshBasicMaterial color="#ffedbb" fog={false} />
      </mesh>
    </>
  );
}
