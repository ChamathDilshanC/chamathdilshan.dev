"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Group, Mesh, DoubleSide } from "three";
import { useEffect } from "react";
import {
  actionAt,
  type CharacterAction,
} from "@/animation/character-animations";
import { journey, useExperience } from "@/stores/experience-store";
import { portfolio } from "@/config/portfolio";
import { KTX2Loader } from "three-stdlib";

function ImportedWarrior({ url }: { url: string }) {
  const gl = useThree((s) => s.gl);
  const ktx2 = useMemo(
    () =>
      new KTX2Loader()
        .setTranscoderPath("/assets/decoders/basis/")
        .detectSupport(gl),
    [gl],
  );
  const model = useGLTF(url, "/assets/decoders/draco/", true, (loader) =>
    loader.setKTX2Loader(ktx2),
  );
  useEffect(
    () => () => {
      ktx2.dispose();
    },
    [ktx2],
  );
  const { actions } = useAnimations(model.animations, model.scene);
  const current = useRef("");
  useFrame(() => {
    const next = journey.animation;
    if (next !== current.current) {
      actions[current.current]?.fadeOut(0.25);
      (actions[next] ?? actions.Idle)?.reset().fadeIn(0.25).play();
      current.current = next;
    }
  });
  useEffect(
    () => () => {
      Object.values(actions).forEach((action) => action?.stop());
    },
    [actions],
  );
  return <primitive object={model.scene} />;
}

export function Warrior() {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const arm = useRef<Group>(null);
  const cloak = useRef<Mesh>(null);
  const sword = useRef<Group>(null);
  const reduced = useExperience((s) => s.reducedMotion);
  useFrame(() => {
    if (!root.current || !body.current) return;
    const p = reduced ? 0 : journey.progress;
    const t = reduced ? 0 : journey.time;
    const exploring = useExperience.getState().explore;
    const a: CharacterAction = reduced
      ? "Idle"
      : journey.debug.animation !== "Auto"
        ? (journey.debug.animation as CharacterAction)
        : exploring
          ? journey.explore.dodge > performance.now() / 1000
            ? "Dodge"
            : journey.explore.moving
              ? journey.explore.sprint
                ? "Run"
                : "Walk"
              : "Idle"
          : actionAt(p);
    journey.animation = a;
    const walk = a === "Walk" || a === "Run";
    const stride = exploring ? t * (a === "Run" ? 11 : 7) : p * 240;
    const smooth = (start: number, end: number) => {
      const x = Math.max(0, Math.min(1, (p - start) / (end - start)));
      return x * x * (3 - 2 * x);
    };
    const kneel =
      journey.debug.animation === "Kneel"
        ? 1
        : smooth(0.82, 0.845) * (1 - smooth(0.89, 0.92));
    root.current.position.set(
      exploring ? journey.explore.x : Math.sin(p * 8) * 1.1,
      0,
      -p * 80 + (exploring ? journey.explore.z : 0),
    );
    root.current.rotation.y = exploring
      ? journey.explore.yaw
      : smooth(0.035, 0.075) * (-0.6 + Math.sin(p * 12) * 0.3);
    body.current.position.y =
      0.025 * Math.sin(t * 1.6) +
      (walk
        ? Math.abs(Math.sin(stride)) * 0.065
        : a === "Dodge"
          ? -0.55
          : -0.55 * kneel);
    body.current.rotation.z = a === "Dodge" ? -0.5 : 0;
    body.current.rotation.y = a.includes("Attack")
      ? Math.sin((p - 0.425) * 110) * 0.8
      : 0;
    if (left.current && right.current) {
      left.current.rotation.x = walk ? Math.sin(stride) * 0.4 : -kneel;
      right.current.rotation.x = walk ? -Math.sin(stride) * 0.4 : 0.5 * kneel;
    }
    if (arm.current)
      arm.current.rotation.x =
        a === "Sword Draw"
          ? -1.2
          : a === "Block"
            ? -1.8
            : a.includes("Attack")
              ? -1.2 + Math.sin(p * 200) * 1.7
              : walk
                ? -Math.sin(stride) * 0.2
                : 0.12;
    if (sword.current)
      sword.current.rotation.z =
        a.includes("Attack") || a === "Block" ? -0.9 : 0.2;
    if (cloak.current) {
      cloak.current.rotation.x =
        0.12 + Math.sin(t * 1.9) * 0.035 + (walk ? 0.14 : 0);
      cloak.current.rotation.z = Math.sin(t * 1.3) * 0.035;
    }
  });
  return (
    <group ref={root}>
      <group ref={body}>
        {portfolio.assets.warrior ? (
          <ImportedWarrior url={portfolio.assets.warrior} />
        ) : (
          <>
            <group position={[0, 1.25, 0]}>
              <mesh castShadow scale={[0.65, 1, 0.43]}>
                <cylinderGeometry args={[0.42, 0.48, 1.1, 9]} />
                <meshStandardMaterial color="#202824" roughness={0.95} />
              </mesh>
              <mesh position={[0, -0.22, 0]} scale={[1, 1, 0.67]}>
                <cylinderGeometry args={[0.45, 0.46, 0.16, 10]} />
                <meshStandardMaterial color="#b28b47" />
              </mesh>
              <mesh position={[0.14, -0.55, 0.28]} rotation={[0.1, 0, -0.12]}>
                <boxGeometry args={[0.17, 0.65, 0.035]} />
                <meshStandardMaterial color="#c9ba91" side={DoubleSide} />
              </mesh>
              {[1, -1].map((side) => (
                <group
                  key={side}
                  position={[side * 0.24, -0.6, 0]}
                  ref={side === 1 ? left : right}
                >
                  <mesh position={[0, -0.29, 0]} scale={[1, 1, 1.1]}>
                    <cylinderGeometry args={[0.21, 0.12, 0.8, 7]} />
                    <meshStandardMaterial color="#1b211f" />
                  </mesh>
                  <mesh position={[0, -0.68, -0.055]}>
                    <boxGeometry args={[0.21, 0.13, 0.36]} />
                    <meshStandardMaterial color="#131916" />
                  </mesh>
                </group>
              ))}
              <mesh
                ref={cloak}
                position={[0, -0.06, 0.23]}
                rotation={[0.12, 0, 0]}
                scale={[1, 1, 0.42]}
                castShadow
              >
                <coneGeometry
                  args={[0.86, 1.78, 11, 3, true, 0.12, Math.PI * 1.78]}
                />
                <meshStandardMaterial
                  color="#18231f"
                  roughness={1}
                  side={DoubleSide}
                />
              </mesh>
              <mesh position={[0, 0.73, 0]}>
                <sphereGeometry args={[0.24, 10, 8]} />
                <meshStandardMaterial color="#5c4c36" />
              </mesh>
              <mesh position={[0, 0.67, -0.17]}>
                <boxGeometry args={[0.32, 0.19, 0.16]} />
                <meshStandardMaterial color="#202723" />
              </mesh>
              <group position={[0, 0.98, 0]} rotation={[0.06, 0, -0.08]}>
                <mesh castShadow>
                  <coneGeometry args={[0.76, 0.3, 32]} />
                  <meshStandardMaterial
                    color="#786849"
                    roughness={1}
                    side={DoubleSide}
                  />
                </mesh>
                <mesh position={[0, -0.148, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.75, 0.018, 4, 40]} />
                  <meshStandardMaterial color="#b2a071" />
                </mesh>
                {Array.from({ length: 24 }, (_, i) => (
                  <mesh
                    key={i}
                    position={[
                      Math.cos((i / 24) * Math.PI * 2) * 0.37,
                      0,
                      Math.sin((i / 24) * Math.PI * 2) * 0.37,
                    ]}
                    rotation={[0, (-i / 24) * Math.PI * 2, -0.19]}
                  >
                    <boxGeometry args={[0.74, 0.006, 0.01]} />
                    <meshStandardMaterial color="#a68f5e" />
                  </mesh>
                ))}
              </group>
              <mesh
                position={[-0.49, 0.25, 0]}
                rotation={[0, 0, -0.2]}
                scale={[1, 0.45, 1]}
              >
                <sphereGeometry args={[0.35, 8, 6]} />
                <meshStandardMaterial
                  color="#343b31"
                  metalness={0.35}
                  roughness={0.6}
                />
              </mesh>
              <group ref={arm} position={[0.42, 0.25, -0.03]}>
                <mesh position={[0, -0.3, 0]} rotation={[0, 0, -0.13]}>
                  <cylinderGeometry args={[0.17, 0.105, 0.7, 8]} />
                  <meshStandardMaterial color="#3b3c2a" />
                </mesh>
                <group
                  ref={sword}
                  position={[0.08, -0.65, -0.12]}
                  rotation={[0, 0, 0.2]}
                >
                  <mesh position={[0, -0.55, 0]}>
                    <boxGeometry args={[0.038, 1.3, 0.025]} />
                    <meshStandardMaterial
                      color="#c6cbc1"
                      metalness={0.95}
                      roughness={0.22}
                    />
                  </mesh>
                  <mesh position={[0, 0.08, 0]}>
                    <boxGeometry args={[0.2, 0.035, 0.12]} />
                    <meshStandardMaterial
                      color="#957846"
                      metalness={0.8}
                      roughness={0.4}
                    />
                  </mesh>
                  <mesh position={[0, 0.22, 0]}>
                    <cylinderGeometry args={[0.043, 0.04, 0.3, 8]} />
                    <meshStandardMaterial color="#141b18" />
                  </mesh>
                </group>
              </group>
              <mesh position={[-0.5, -0.42, 0.12]} rotation={[0.1, 0, -0.7]}>
                <cylinderGeometry args={[0.055, 0.035, 1.55, 8]} />
                <meshStandardMaterial color="#121b18" roughness={0.65} />
              </mesh>
            </group>
          </>
        )}
      </group>
    </group>
  );
}
