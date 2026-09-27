"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useProgress } from "@react-three/drei";
import {
  Box3,
  Group,
  Mesh,
  PerspectiveCamera,
  Vector3,
  MathUtils,
  SkinnedMesh,
  type Material,
  Texture,
  AnimationMixer,
} from "three";
import { clone as cloneWithBones } from "three/addons/utils/SkeletonUtils.js";
import {
  journey,
  useExperience,
  playModelAction,
} from "@/stores/experience-store";
import {
  actionPose,
  actionDuration,
  type Actor,
} from "@/animation/model-actions";
import ActionEffects from "@/components/effects/ActionEffects";
import Cybertron from "./Cybertron";
import VehicleAnnotations from "./VehicleAnnotations";
import { vehicleInteraction } from "@/lib/vehicle-interaction";
import { vehicleById, type VehicleId } from "@/config/vehicles";
import {
  FlightBounds,
  sampleScrollFlight,
  routeProgressFromScroll,
  createFlight,
  createFlightCurve,
  cybertronLayout,
} from "@/animation/gunship-flight";

type ModelName = VehicleId;

// A failed optional asset must not take down the scene or the HTML portfolio.
class AssetBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useExperience.getState().set({ modelError: true });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Model({
  name,
  height,
  position,
  rotation = 0,
  actor = false,
}: {
  name: ModelName;
  height: number;
  position: [number, number, number];
  rotation?: number;
  actor?: boolean;
}) {
  const { scene, animations } = useGLTF(
    `/assets/models/${name}.glb`,
    "/assets/decoders/draco/",
  );
  const root = useRef<Group>(null);
  const pivot = useRef<Group>(null);
  const motion = useRef(actionPose("cast", -1));
  const maxAnisotropy = useThree((state) =>
    state.gl.capabilities.getMaxAnisotropy(),
  );
  const flight = useRef(createFlight());
  const flightCurve = useRef(createFlightCurve());
  const flightBounds = useRef(new FlightBounds());
  const planetLayout = useRef(cybertronLayout(1, false));
  const frame = useRef({
    width: 1,
    depth: 22,
    mobile: false,
    left: 0,
    right: 0,
    dockX: 0,
    dockY: 0,
    dockZ: 0,
  });
  const nextAuto = useRef(0);
  const activeBefore = useRef(false);
  const { object, scale, offset, radius } = useMemo(() => {
    // The fighter is skinned: an ordinary Object3D clone leaves its bones tied
    // to the cached source and its body ignores the animated parent transform.
    const object = cloneWithBones(scene);
    object.updateMatrixWorld(true);
    object.traverse((node) => {
      if (node instanceof SkinnedMesh) {
        node.skeleton.update();
        node.computeBoundingBox();
      }
    });
    const bounds = new Box3().setFromObject(object);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const scale =
      name === "fighter"
        ? height / Math.max(0.001, size.y)
        : 8 / Math.max(size.x, size.y, size.z, 0.001);
    object.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = actor;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const material of materials) {
          const texturedMaterial = material as Material &
            Record<string, unknown>;
          for (const key of [
            "map",
            "normalMap",
            "roughnessMap",
            "metalnessMap",
            "aoMap",
            "emissiveMap",
          ]) {
            const texture = texturedMaterial[key];
            if (texture instanceof Texture) {
              texture.anisotropy = maxAnisotropy;
              texture.needsUpdate = true;
            }
          }
          material.needsUpdate = true;
        }
      }
    });
    return {
      object,
      scale,
      radius: (bounds.getSize(new Vector3()).length() * scale) / 2,
      offset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [scene, height, actor, maxAnisotropy, name]);
  const mixer = useMemo(() => new AnimationMixer(object), [object]);
  useEffect(() => {
    const clip = animations[0];
    if (clip) mixer.clipAction(clip).play();
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(object);
    };
  }, [animations, mixer, object]);
  const mechanisms = useMemo(
    () =>
      ["Jet_L_02_8", "Jet_R_03_9", "Gun_L_03_06_12", "Gun_R_03_09_15"].flatMap(
        (boneName) => {
          const bone = object.getObjectByName(boneName);
          return bone
            ? [
                {
                  bone,
                  rotation: bone.rotation.clone(),
                  position: bone.position.clone(),
                },
              ]
            : [];
        },
      ),
    [object],
  );
  // These are imperative Three.js handles, kept outside React's render values.
  const mechanismsRef = useRef(mechanisms);
  useEffect(() => {
    mechanismsRef.current = mechanisms;
  }, [mechanisms]);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    performance.mark(`portfolio:model:${name}`, { detail: { scale, offset } });
    invalidate();
    return () => performance.clearMarks(`portfolio:model:${name}`);
  }, [name, invalidate, scale, offset]);
  useEffect(
    () => () => {
      object.traverse((node) => {
        if (node instanceof SkinnedMesh) node.skeleton.dispose();
      });
    },
    [object],
  );
  useFrame(({ camera }, delta) => {
    if (!root.current) return;
    // Keep the selected surface still while its original close-up is open.
    if (useExperience.getState().annotation !== null) return;
    const reduced = useExperience.getState().reducedMotion;
    if (!reduced && animations.length) mixer.update(Math.min(delta, 0.05));
    const p = journey.visualProgress;
    const t = reduced ? 0 : journey.time;
    const state = useExperience.getState();
    const active =
      actor &&
      name === "fighter" &&
      routeProgressFromScroll(journey.progress) < 0.78;
    if (active && !activeBefore.current) nextAuto.current = t + 2.5;
    activeBefore.current = active;
    const request = state.action;
    motion.current = actionPose(
      request?.kind ?? "cast",
      request?.actor === name && !reduced ? t - request.started : -1,
    );
    if (
      actor &&
      request?.actor === name &&
      (reduced ||
        !active ||
        t - request.started >= actionDuration[request.kind])
    ) {
      state.set({ action: null });
      nextAuto.current = t + 7;
    } else if (
      active &&
      !reduced &&
      !request &&
      state.autoActions &&
      !state.driving &&
      !state.project &&
      !state.modelsLoading &&
      t >= nextAuto.current
    ) {
      playModelAction(name === "fighter" ? "fire" : "cast", name as Actor);
    }
    const pose = motion.current;
    for (const part of mechanismsRef.current) {
      part.bone.rotation.copy(part.rotation);
      part.bone.position.copy(part.position);
      if (!reduced && part.bone.name.startsWith("Jet_"))
        part.bone.rotation.set(
          part.rotation.x,
          part.rotation.y +
            Math.sin(t * 0.8) * 0.12 * (1 - flight.current.dock),
          part.rotation.z,
          part.rotation.order,
        );
      if (!reduced && part.bone.name.startsWith("Gun_"))
        part.bone.position.setZ(
          part.position.z +
            Math.abs(Math.sin(t * 18)) *
              pose.fire *
              7 *
              (part.bone.name.includes("_R_") ? -1 : 1),
        );
    }
    if (!actor) return;
    const view = camera as PerspectiveCamera;
    const mobile = view.aspect < 0.85;
    const width =
      2 *
      Math.tan(MathUtils.degToRad(view.fov / 2)) *
      view.position.z *
      view.aspect;
    const planet = cybertronLayout(width, mobile, planetLayout.current);
    // Fit the entire rotated ship into portrait view, including its long nose.
    const cruiseScale = Math.min(
      1,
      (width * (mobile ? (name === "fighter" ? 0.29 : 0.39) : 0.22)) / radius,
    );
    const bounds = flightBounds.current;
    // At the wrap both sides share this height/depth and the maximum ship size.
    bounds.update(
      view,
      mobile ? -0.2 : 3.7,
      0,
      radius * cruiseScale * 1.12 + 0.15,
    );
    frame.current.width = width;
    frame.current.depth = view.position.z;
    frame.current.mobile = mobile;
    frame.current.left = bounds.left;
    frame.current.right = bounds.right;
    frame.current.dockX = planet.x - planet.radius * 0.66;
    frame.current.dockY = planet.y + planet.radius * 0.6;
    frame.current.dockZ = planet.z + planet.radius + 1.2;
    const path = sampleScrollFlight(
      p,
      frame.current,
      flight.current,
      flightCurve.current,
    );
    const ease = path.dock;
    // Preserve portrait framing on the original route, but allow real perspective
    // growth as the new fly-by approaches the viewer.
    const perspectiveFit = Math.min(
      1,
      (view.position.z - path.z) / view.position.z,
    );
    const targetScale =
      cruiseScale *
      MathUtils.lerp(perspectiveFit, 1, Math.max(ease, path.proximity)) *
      path.scale;
    root.current.scale.setScalar(targetScale);
    const manual = vehicleInteraction;
    const dx = state.driving
      ? Number(manual.held.has("ArrowRight")) -
        Number(manual.held.has("ArrowLeft"))
      : 0;
    const dz = state.driving
      ? Number(manual.held.has("ArrowDown")) -
        Number(manual.held.has("ArrowUp"))
      : 0;
    const dt = Math.min(delta, 0.05);
    const magnitude = Math.max(1, Math.hypot(dx, dz));
    manual.vx = MathUtils.damp(manual.vx, (dx / magnitude) * 2.8, 8, dt);
    manual.vz = MathUtils.damp(manual.vz, (dz / magnitude) * 2.8, 8, dt);
    manual.x = state.driving
      ? MathUtils.clamp(manual.x + manual.vx * dt, -width * 0.2, width * 0.2)
      : MathUtils.damp(manual.x, 0, 7, dt);
    manual.z = state.driving
      ? MathUtils.clamp(manual.z + manual.vz * dt, -2, 1.8)
      : MathUtils.damp(manual.z, 0, 7, dt);
    if (reduced && !state.driving)
      manual.x = manual.z = manual.vx = manual.vz = 0;
    root.current.position.set(path.x + manual.x, path.y, path.z + manual.z);
    root.current.rotation.set(
      path.pitch,
      path.yaw + vehicleById(name).yaw - manual.vx * 0.09,
      path.roll - (name === "fighter" ? manual.vx * 0.025 : 0),
      "YXZ",
    );
    if (pivot.current) {
      pivot.current.position.y = reduced
        ? 0
        : Math.sin(t * 0.65) * 0.045 * (1 - ease);
      pivot.current.rotation.set(
        pose.pitch * (1 - ease),
        0,
        (Math.sin(t * 0.45) * 0.006 + pose.roll) * (1 - ease),
      );
    }
    root.current.userData.flight = flight.current;
    root.current.userData.vehicle = name;
  });
  return (
    <group
      ref={root}
      name="gunship"
      position={position}
      rotation={[0, rotation, 0]}
      scale={1}
      onClick={
        actor
          ? (event) => {
              if (name !== "fighter") return;
              event.stopPropagation();
              playModelAction(
                name === "fighter" ? "fire" : "cast",
                name as Actor,
              );
            }
          : undefined
      }
    >
      <group ref={pivot}>
        <group>
          <group scale={scale}>
            <primitive object={object} position={offset} dispose={null} />
            <VehicleAnnotations name={name} offset={offset} />
          </group>
          {name === "fighter" && actor && (
            <ActionEffects actor="fighter" pose={motion} />
          )}
        </group>
      </group>
    </group>
  );
}

function Asset(props: React.ComponentProps<typeof Model>) {
  return (
    <AssetBoundary>
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
    </AssetBoundary>
  );
}

function VehicleLoader({ name }: { name: VehicleId }) {
  useGLTF(`/assets/models/${name}.glb`, "/assets/decoders/draco/");
  useEffect(() => {
    if (useExperience.getState().selectedVehicle === name)
      useExperience.getState().set({ activeVehicle: name });
  }, [name]);
  return null;
}

export default function ModelStage() {
  const selected = useExperience((state) => state.selectedVehicle);
  const active = useExperience((state) => state.activeVehicle);
  useEffect(() => {
    let mounted = true;
    // Loader callbacks can run during a suspended render. Defer UI store writes
    // so a newly requested model never updates another component in render.
    const sync = (state: ReturnType<typeof useProgress.getState>) =>
      queueMicrotask(() => {
        if (mounted)
          useExperience.getState().set({
            modelsLoading: state.active,
            modelProgress: state.progress,
          });
      });
    sync(useProgress.getState());
    const unsubscribe = useProgress.subscribe(sync);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);
  return (
    <>
      <AssetBoundary>
        <Suspense fallback={null}>
          <Cybertron />
        </Suspense>
      </AssetBoundary>
      {selected !== active && (
        <AssetBoundary key={selected}>
          <Suspense fallback={null}>
            <VehicleLoader name={selected} />
          </Suspense>
        </AssetBoundary>
      )}
      <Asset
        key={active}
        name={active}
        height={3.8}
        position={[0, 1.25, 0]}
        rotation={-0.6}
        actor
      />
    </>
  );
}
