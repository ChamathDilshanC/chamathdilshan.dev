"use client";
import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  Box3,
  Group,
  MathUtils,
  PerspectiveCamera,
  SkinnedMesh,
  Vector3,
} from "three";
import { clone as cloneWithBones } from "three/addons/utils/SkeletonUtils.js";
import {
  cybertronLayout,
  routeProgressFromScroll,
} from "@/animation/gunship-flight";
import { journey, useExperience } from "@/stores/experience-store";

export default function Cybertron() {
  const { scene } = useGLTF(
    "/assets/models/cybertron.glb",
    "/assets/decoders/draco/",
  );
  const root = useRef<Group>(null);
  const layoutRef = useRef(cybertronLayout(1, false));
  const { object, scale, offset } = useMemo(() => {
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
    return {
      object,
      scale: 2 / Math.max(size.x, size.y, size.z),
      offset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [scene]);
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
    const view = camera as PerspectiveCamera;
    const width =
      2 *
      Math.tan(MathUtils.degToRad(view.fov / 2)) *
      view.position.z *
      view.aspect;
    const layout = cybertronLayout(
      width,
      view.aspect < 0.85,
      layoutRef.current,
    );
    const reveal = MathUtils.smootherstep(
      routeProgressFromScroll(journey.visualProgress),
      0.76,
      0.9,
    );
    const reduced = useExperience.getState().reducedMotion;
    const size = reduced
      ? reveal
      : MathUtils.damp(
          root.current.scale.x / layout.radius,
          reveal,
          6,
          Math.min(delta, 0.05),
        );
    root.current.visible = size > 0.001;
    const dt = Math.min(delta, 0.05);
    root.current.position.set(
      reduced
        ? layout.x
        : MathUtils.damp(root.current.position.x, layout.x, 6, dt),
      reduced
        ? layout.y
        : MathUtils.damp(root.current.position.y, layout.y, 6, dt),
      layout.z - (1 - size) * 8,
    );
    root.current.scale.setScalar(Math.max(0.0001, size * layout.radius));
    root.current.rotation.y = -0.3 + reveal * 0.45;
  });
  return (
    <group ref={root} name="cybertron" scale={0.0001}>
      <group scale={scale}>
        <primitive object={object} position={offset} dispose={null} />
      </group>
    </group>
  );
}
