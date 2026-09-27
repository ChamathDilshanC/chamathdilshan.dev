"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  Vector3,
  FogExp2,
  DirectionalLight,
  PCFShadowMap,
  ACESFilmicToneMapping,
  SRGBColorSpace,
  DataTexture,
  RGBAFormat,
  HalfFloatType,
  CubeUVReflectionMapping,
  LinearFilter,
  LinearSRGBColorSpace,
} from "three";
import studioEnvironment from "@/public/assets/studio-env.json";
import {
  journey,
  qualitySettings,
  useExperience,
  type Quality,
} from "@/stores/experience-store";
import ModelStage from "@/components/environment/ModelStage";
import PerformanceProbe from "./PerformanceProbe";
import { smoothFlightProgress } from "@/animation/gunship-flight";
import { vehicleInteraction } from "@/lib/vehicle-interaction";

function Director() {
  const { invalidate } = useThree();
  const targetRef = useRef(new Vector3());
  const destinationRef = useRef(new Vector3());
  const lookRef = useRef(new Vector3(0, 2.5, 0));
  const scrollMotion = useRef({ velocity: 0 });
  const sample = useRef({ time: 0, frames: 0, slow: 0, cpu: 0 });
  useEffect(() => useExperience.subscribe(() => invalidate()), [invalidate]);
  useEffect(() => {
    journey.requestFrame = invalidate;
    return () => {
      journey.requestFrame = null;
    };
  }, [invalidate]);
  useEffect(() => {
    useExperience.getState().set({ ready: true, phase: "INTRO" });
  }, []);
  useFrame(({ camera, gl, scene }, delta) => {
    const target = targetRef.current;
    const destination = destinationRef.current;
    const state = useExperience.getState();
    if (state.reducedMotion) scrollMotion.current.velocity = 0;
    journey.visualProgress = state.reducedMotion
      ? journey.progress
      : smoothFlightProgress(
          journey.visualProgress,
          journey.progress,
          delta,
          scrollMotion.current,
        );
    journey.time += state.reducedMotion
      ? 0
      : Math.min(delta, 0.05) * (state.project ? 0.18 : 1);
    const panel = state.project ? 1.8 : 0;
    const aspect = (camera as PerspectiveCamera).aspect;
    destination.set(0, 3.4, aspect > 1.85 ? 17.5 : 15.2);
    target.set(0, 2.5, 0);
    destination.x +=
      journey.pointer.x * (state.reducedMotion ? 0 : 0.35) + panel;
    destination.y += journey.pointer.y * (state.reducedMotion ? 0 : 0.15);
    if (aspect < 0.85) {
      destination.set(0, 3.8, 22);
      target.set(0, 1, 0);
    }
    destination.x += journey.debug.cameraOffset[0]!;
    destination.y += journey.debug.cameraOffset[1]!;
    destination.z += journey.debug.cameraOffset[2]!;
    target.x += journey.debug.targetOffset[0]!;
    target.y += journey.debug.targetOffset[1]!;
    target.z += journey.debug.targetOffset[2]!;
    if (state.explore) {
      destination.x += journey.explore.x;
      destination.z += journey.explore.z;
      target.x += journey.explore.x * 0.3;
      target.z += journey.explore.z * 0.3;
    }
    const inspecting =
      state.annotation !== null &&
      vehicleInteraction.focusVehicle === state.activeVehicle &&
      vehicleInteraction.focusIndex === state.annotation;
    if (inspecting) {
      destination.copy(vehicleInteraction.eye);
      target.copy(vehicleInteraction.target);
      // A portrait viewport needs more distance to keep the close-up in frame.
      if (aspect < 1)
        destination
          .sub(target)
          .multiplyScalar(1 / Math.sqrt(aspect))
          .add(target);
    }
    if (state.reducedMotion) camera.position.copy(destination);
    else camera.position.lerp(destination, 1 - Math.exp(-delta * 5));
    if (state.reducedMotion) lookRef.current.copy(target);
    else lookRef.current.lerp(target, 1 - Math.exp(-delta * 5));
    camera.lookAt(lookRef.current);
    const perspective = camera as PerspectiveCamera;
    const flightFov = inspecting
      ? 23
      : aspect < 0.65
        ? 49
        : aspect > 1.85
          ? 55
          : 52;
    perspective.fov +=
      ((journey.debug.fov || flightFov) - perspective.fov) *
      (1 - Math.exp(-delta * 4));
    if (state.reducedMotion) perspective.fov = journey.debug.fov || flightFov;
    perspective.updateProjectionMatrix();
    if (scene.fog instanceof FogExp2) scene.fog.density = journey.debug.fog;
    sample.current.frames++;
    sample.current.time += delta;
    if (sample.current.time >= 2) {
      journey.fps = Math.round(sample.current.frames / sample.current.time);
      journey.calls = gl.info.render.calls;
      journey.triangles = gl.info.render.triangles;
      journey.textures = gl.info.memory.textures;
      journey.geometries = gl.info.memory.geometries;
      journey.camera = camera.position.toArray();
      journey.target = target.toArray();
      journey.fov = perspective.fov;
      performance.clearMarks("portfolio:render");
      performance.mark("portfolio:render", {
        detail: {
          fps: journey.fps,
          cpuRenderMs: journey.cpuMs,
          gpuMs: journey.gpuMs,
          drawCalls: journey.calls,
          triangles: journey.triangles,
          textures: journey.textures,
          geometries: journey.geometries,
          quality: state.quality,
          camera: camera.position.toArray(),
          progress: journey.progress,
          visualProgress: journey.visualProgress,
          flight: scene.getObjectByName("gunship")?.userData.flight,
          shipPosition: scene.getObjectByName("gunship")?.position.toArray(),
          shipScale: scene.getObjectByName("gunship")?.scale.x,
          planet: scene.getObjectByName("cybertron")?.scale.x,
        },
      });
      sample.current.slow = journey.fps < 42 ? sample.current.slow + 1 : 0;
      // A manual tier is an upper bound: sustained severe stalls still recover.
      if ((state.autoQuality || journey.fps < 25) && sample.current.slow >= 2) {
        const tiers: Quality[] = ["ULTRA", "HIGH", "MEDIUM", "LOW"];
        const next = tiers[Math.min(3, tiers.indexOf(state.quality) + 1)]!;
        if (next !== state.quality) state.set({ quality: next });
        sample.current.slow = 0;
      }
      sample.current.frames = 0;
      sample.current.time = 0;
      sample.current.cpu = 0;
    }
  });
  return null;
}

function Lighting() {
  const light = useRef<DirectionalLight>(null);
  useFrame(() => {
    if (light.current) {
      light.current.intensity = journey.debug.light;
    }
  });
  const quality = useExperience((s) => s.quality);
  const q = qualitySettings[quality];
  return (
    <>
      <hemisphereLight args={["#badbd8", "#172c31", 1.6]} />
      <directionalLight
        ref={light}
        position={[2, 9, 8]}
        color="#fff0d6"
        intensity={4.5}
        castShadow={q.shadows}
        shadow-mapSize={[q.shadowSize, q.shadowSize]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-normalBias={0.04}
      />
      <ambientLight intensity={0.2} />
      <directionalLight position={[-6, 5, -4]} color="#48b7b6" intensity={3} />
      <pointLight
        position={[5, 4, 3]}
        color="#bca3ff"
        intensity={12}
        distance={10}
      />
    </>
  );
}

function StudioReflections() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const { scene, invalidate } = get();
    const previous = scene.environment;
    const controller = new AbortController();
    let texture: DataTexture | undefined;
    // The prefiltered map is baked locally, so no expensive environment shader
    // compilation runs during a visitor's first scroll or vehicle selection.
    void fetch("/assets/studio-env.bin", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Studio lighting unavailable");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (controller.signal.aborted) return;
        const { width, height } = studioEnvironment;
        if (buffer.byteLength !== width * height * 8) return;
        texture = new DataTexture(
          new Uint16Array(buffer),
          width,
          height,
          RGBAFormat,
          HalfFloatType,
        );
        texture.mapping = CubeUVReflectionMapping;
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.colorSpace = LinearSRGBColorSpace;
        texture.needsUpdate = true;
        scene.environment = texture;
        invalidate();
      })
      .catch(() => {
        /* Existing direct lights remain a usable fallback. */
      });
    return () => {
      controller.abort();
      if (scene.environment === texture) scene.environment = previous;
      texture?.dispose();
    };
  }, [get]);
  useFrame(({ scene }) => {
    scene.environmentIntensity =
      useExperience.getState().activeVehicle === "fighter" ? 0.2 : 0.85;
  });
  return null;
}

export default function World({ children }: { children?: React.ReactNode }) {
  const quality = useExperience((s) => s.quality);
  const reduced = useExperience((s) => s.reducedMotion);
  const driving = useExperience((s) => s.driving);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, qualitySettings[quality].dpr]}
      shadows={
        qualitySettings[quality].shadows ? { type: PCFShadowMap } : false
      }
      camera={{ position: [0, 3.1, 12.8], fov: 43, near: 0.1, far: 100 }}
      frameloop={!visible ? "never" : reduced && !driving ? "demand" : "always"}
      gl={{
        antialias: quality !== "LOW",
        powerPreference: "high-performance",
        alpha: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#ffffff", 1);
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            useExperience.getState().set({ flat: true, ready: true });
          },
          { once: true },
        );
      }}
    >
      <color attach="background" args={["#ffffff"]} />
      <fogExp2 attach="fog" args={["#ffffff", 0.012]} />
      <Lighting />
      <StudioReflections />
      <Director />
      <PerformanceProbe />
      <ModelStage />
      {children}
    </Canvas>
  );
}
