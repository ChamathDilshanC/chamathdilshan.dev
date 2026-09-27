"use client";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { journey } from "@/stores/experience-store";

// Measure actual render submission; GPU timing is optional and never fabricated.
export default function PerformanceProbe() {
  const renderer = useThree((s) => s.gl);
  useEffect(() => {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    const extension = gl.getExtension("EXT_disjoint_timer_query_webgl2");
    const original = renderer.render.bind(renderer);
    const pending: WebGLQuery[] = [];
    let frame = 0;
    let sum = 0;
    let samples = 0;
    // Three's renderer is an imperative external resource, not React state.
    // eslint-disable-next-line react-hooks/immutability
    renderer.render = (scene, camera) => {
      frame++;
      const start = performance.now();
      const query =
        extension && frame % 30 === 0 && pending.length < 4
          ? gl.createQuery()
          : null;
      if (query) gl.beginQuery(extension.TIME_ELAPSED_EXT, query);
      original(scene, camera);
      if (query) {
        gl.endQuery(extension.TIME_ELAPSED_EXT);
        pending.push(query);
      }
      sum += performance.now() - start;
      samples++;
      if (samples >= 60) {
        journey.cpuMs = sum / samples;
        sum = 0;
        samples = 0;
      }
      const first = pending[0];
      if (first && gl.getQueryParameter(first, gl.QUERY_RESULT_AVAILABLE)) {
        if (!gl.getParameter(extension.GPU_DISJOINT_EXT))
          journey.gpuMs = gl.getQueryParameter(first, gl.QUERY_RESULT) / 1e6;
        gl.deleteQuery(first);
        pending.shift();
      }
    };
    return () => {
      renderer.render = original;
      pending.forEach((query) => gl.deleteQuery(query));
    };
  }, [renderer]);
  return null;
}
