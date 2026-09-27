"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { journey } from "@/stores/experience-store";

// Optional ULTRA-only depth of field. Other tiers have no postprocessing targets.
export default function CinematicFocus() {
  const { gl, scene, camera, size } = useThree();
  const pipeline = useRef<{
    composer: EffectComposer;
    focus: BokehPass;
  } | null>(null);
  useEffect(() => {
    const composer = new EffectComposer(gl);
    // DOF is an atmospheric accent; a reduced-resolution pass keeps its cost bounded.
    composer.setPixelRatio(Math.min(1, gl.getPixelRatio()) * .7);
    const render = new RenderPass(scene, camera);
    const focus = new BokehPass(scene, camera, {
      focus: 18,
      aperture: 0.00008,
      maxblur: 0.003,
    });
    const output = new OutputPass();
    composer.addPass(render);
    composer.addPass(focus);
    composer.addPass(output);
    pipeline.current = { composer, focus };
    return () => {
      pipeline.current = null;
      focus.dispose();
      output.dispose();
      render.dispose();
      composer.dispose();
    };
  }, [gl, scene, camera]);
  useEffect(() => {
    pipeline.current?.composer.setSize(size.width, size.height);
  }, [size]);
  useFrame(({ gl: renderer, scene: world, camera: view }, delta) => {
    const active = pipeline.current;
    if (!active) {
      renderer.render(world, view);
      return;
    }
    const distance = Math.hypot(
      view.position.x,
      view.position.y - 1.5,
      view.position.z + journey.progress * 80,
    );
    const uniforms = active.focus.uniforms as { focus: { value: number } };
    uniforms.focus.value +=
      (distance - uniforms.focus.value) * Math.min(1, delta * 3);
    active.composer.render(delta);
  }, 1);
  return null;
}
