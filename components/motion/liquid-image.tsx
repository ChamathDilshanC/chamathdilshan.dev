"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/*
 * Liquid hover: a small GPU fluid simulation (stable fluids) that drives the
 * distortion of an image.
 *
 * Each frame:
 *   1. Mouse movement splats velocity into the flow, and "ink" into a second
 *      field that marks how strongly each area is disturbed.
 *   2. The flow is made incompressible (divergence -> pressure -> gradient),
 *      which turns pushes into swirls.
 *   3. Velocity and ink are carried along the flow (ink 8x faster, so it
 *      stretches into long streaks) and both slowly fade.
 *   4. The image is drawn with every pixel pushed along the local flow
 *      direction by the amount of ink there. Direction flips inside swirls
 *      give the sharp, folded "melted" look.
 */

const OVERSCAN = 1.2; // canvas is 20% larger than the image so swirls never expose edges
const INNER = 1 / OVERSCAN;
const PRESSURE_STEPS = 16;
const KEEP_RUNNING_MS = 4500; // keep simulating after the last movement while the ink fades

const VERT = `
precision highp float;
attribute vec2 a_position;
uniform vec2 u_texel;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  vUv = a_position * 0.5 + 0.5;
  vL = vUv - vec2(u_texel.x, 0.0);
  vR = vUv + vec2(u_texel.x, 0.0);
  vT = vUv + vec2(0.0, u_texel.y);
  vB = vUv - vec2(0.0, u_texel.y);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const SPLAT = `
precision highp float;
uniform sampler2D u_target;
uniform float u_aspect;
uniform vec3 u_value;
uniform vec2 u_point;
uniform float u_radius;
varying vec2 vUv;
void main() {
  vec2 p = vUv - u_point;
  p.x *= u_aspect;
  vec3 splat = 0.6 * exp2(-dot(p, p) / u_radius) * u_value;
  gl_FragColor = vec4(texture2D(u_target, vUv).xyz + splat, 1.0);
}`;

const ADVECT = `
precision highp float;
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_texel;
uniform float u_dt;
uniform float u_dissipation;
varying vec2 vUv;
void main() {
  vec2 from = vUv - u_dt * texture2D(u_velocity, vUv).xy * u_texel;
  gl_FragColor = u_dissipation * texture2D(u_source, from);
}`;

const DIVERGENCE = `
precision highp float;
uniform sampler2D u_velocity;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  float l = texture2D(u_velocity, vL).x;
  float r = texture2D(u_velocity, vR).x;
  float t = texture2D(u_velocity, vT).y;
  float b = texture2D(u_velocity, vB).y;
  gl_FragColor = vec4(0.25 * (r - l + t - b), 0.0, 0.0, 1.0);
}`;

const PRESSURE = `
precision highp float;
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  float l = texture2D(u_pressure, vL).x;
  float r = texture2D(u_pressure, vR).x;
  float t = texture2D(u_pressure, vT).x;
  float b = texture2D(u_pressure, vB).x;
  float div = texture2D(u_divergence, vUv).x;
  gl_FragColor = vec4((l + r + t + b - div) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `
precision highp float;
uniform sampler2D u_pressure;
uniform sampler2D u_velocity;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
void main() {
  float l = texture2D(u_pressure, vL).x;
  float r = texture2D(u_pressure, vR).x;
  float t = texture2D(u_pressure, vT).x;
  float b = texture2D(u_pressure, vB).x;
  vec2 velocity = texture2D(u_velocity, vUv).xy - vec2(r - l, t - b);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const DISPLAY = `
precision highp float;
uniform sampler2D u_image;
uniform sampler2D u_ink;
uniform sampler2D u_velocity;
uniform float u_ratio;
uniform float u_image_ratio;
uniform float u_power;
uniform float u_inner;
varying vec2 vUv;

// Canvas uv -> image uv, with object-fit: cover inside the inner rectangle.
vec2 imageUv(vec2 uv) {
  uv = (uv - 0.5) / u_inner;
  vec2 fit = u_ratio > u_image_ratio ? vec2(1.0, u_image_ratio / u_ratio) : vec2(u_ratio / u_image_ratio, 1.0);
  return uv * fit + 0.5;
}

// Clamp to the image, softening the edge pixels that get stretched outside it.
vec3 sampleImage(vec2 uv) {
  vec2 c = clamp(uv, 0.0, 1.0);
  if (c == uv) return texture2D(u_image, uv).rgb;
  vec3 sum = vec3(0.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      sum += texture2D(u_image, clamp(c + vec2(float(x), float(y)) * 0.002, 0.0, 1.0)).rgb;
    }
  }
  return sum / 9.0;
}

float frameAlpha(vec2 uv) {
  float e = 0.002;
  return smoothstep(0.0, e, uv.x) * smoothstep(1.0, 1.0 - e, uv.x) * smoothstep(0.0, e, uv.y) * smoothstep(1.0, 1.0 - e, uv.y);
}

void main() {
  float ink = texture2D(u_ink, vUv).r;
  vec2 direction = normalize(texture2D(u_velocity, vUv).xy + 0.001);
  vec2 push = u_power * direction * ink;
  vec3 color = sampleImage(imageUv(vUv) - 2.0 * push);
  float alpha = frameAlpha((vUv - 0.5) / u_inner + 0.5 - push);
  gl_FragColor = vec4(color * alpha, alpha);
}`;

type GL = WebGLRenderingContext | WebGL2RenderingContext;
type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };
type Target = { fbo: WebGLFramebuffer; texture: WebGLTexture; width: number; height: number };
type DoubleTarget = { read: Target; write: Target; swap: () => void };

type Props = {
  /** The same image as the element underneath. */
  src: string;
  className?: string;
  /** Brush radius, 0.1 - 1. */
  cursorSize?: number;
  /** How much each movement disturbs the image, 0.1 - 1. */
  cursorPower?: number;
  /** How far disturbed pixels are pushed. */
  distortion?: number;
  /** Simulation detail, 1 - 10. */
  resolution?: number;
};

/**
 * Cursor-driven liquid distortion over an image. It initialises on the first
 * mouse movement over its box, runs only on desktop with a fine pointer,
 * never for reduced motion, and stops rendering once the ink has faded.
 */
export function LiquidImage({ src, className, cursorSize = 0.5, cursorPower = 1, distortion = 0.8, resolution = 4 }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const allowed =
      window.matchMedia("(pointer: fine) and (min-width: 1200px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!allowed) return;

    // Same response curves as the design's controls.
    const radius = 0.001 * (0.5 + ((cursorSize - 0.1) * 4.5) / 0.9);
    const inkAmount = 0.001 * (5 + ((cursorPower - 0.1) * 45) / 0.9);
    const gridSize = 128 + ((resolution - 1) * 384) / 9;

    let gl: GL | null = null;
    let image: WebGLTexture | null = null;
    let imageRatio = 1;
    let programs: Record<"splat" | "advect" | "divergence" | "pressure" | "gradient" | "display", Program> | null = null;
    let velocity: DoubleTarget | null = null;
    let ink: DoubleTarget | null = null;
    let pressure: DoubleTarget | null = null;
    let divergence: Target | null = null;
    let simTexel: [number, number] = [0, 0];
    let frame = 0;
    let running = false;
    let started = false;
    let visible = true;
    let disposed = false;
    let lastFrame = 0;
    let lastMove = 0;
    const pointer = { x: 0, y: 0, dx: 0, dy: 0, inside: false, pending: false };

    const fail = () => {
      disposed = true;
      canvas.style.opacity = "0";
    };

    const compile = (type: number, source: string) => {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) ?? "shader");
      return shader;
    };

    const link = (fragment: string): Program => {
      const program = gl!.createProgram()!;
      gl!.attachShader(program, compile(gl!.VERTEX_SHADER, VERT));
      gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, fragment));
      gl!.bindAttribLocation(program, 0, "a_position");
      gl!.linkProgram(program);
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) throw new Error(gl!.getProgramInfoLog(program) ?? "link");
      const uniforms: Program["uniforms"] = {};
      const count = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i++) {
        const info = gl!.getActiveUniform(program, i);
        if (info) uniforms[info.name] = gl!.getUniformLocation(program, info.name);
      }
      return { program, uniforms };
    };

    // Half-float render targets: WebGL2 core, or WebGL1 with extensions.
    let formats: { internal: number; format: number; type: number } | null = null;
    const pickFormats = () => {
      if (typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext) {
        if (!gl.getExtension("EXT_color_buffer_float")) return null;
        return { internal: gl.RGBA16F, format: gl.RGBA, type: gl.HALF_FLOAT };
      }
      const half = gl!.getExtension("OES_texture_half_float");
      if (!half || !gl!.getExtension("OES_texture_half_float_linear")) return null;
      return { internal: gl!.RGBA, format: gl!.RGBA, type: half.HALF_FLOAT_OES };
    };

    const createTarget = (width: number, height: number): Target => {
      const texture = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, formats!.internal, width, height, 0, formats!.format, formats!.type, null);
      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
      if (gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) !== gl!.FRAMEBUFFER_COMPLETE) throw new Error("framebuffer");
      gl!.viewport(0, 0, width, height);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      return { fbo, texture, width, height };
    };

    const createDouble = (width: number, height: number): DoubleTarget => {
      const pair = { read: createTarget(width, height), write: createTarget(width, height), swap: () => {} };
      pair.swap = () => {
        const read = pair.read;
        pair.read = pair.write;
        pair.write = read;
      };
      return pair;
    };

    const deleteTarget = (target: Target | null) => {
      if (!target || !gl) return;
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.fbo);
    };

    const bind = (unit: number, texture: WebGLTexture) => {
      gl!.activeTexture(gl!.TEXTURE0 + unit);
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      return unit;
    };

    const draw = (target: Target | null) => {
      if (target) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
        gl!.viewport(0, 0, target.width, target.height);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
      }
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    };

    const sizeCanvas = () => {
      const width = box.clientWidth;
      const height = box.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.round(width * OVERSCAN * dpr));
      canvas.height = Math.max(2, Math.round(height * OVERSCAN * dpr));
      const simHeight = Math.round(gridSize);
      const simWidth = Math.max(2, Math.round((width / Math.max(1, height)) * gridSize));
      [velocity?.read, velocity?.write, ink?.read, ink?.write, pressure?.read, pressure?.write, divergence].forEach((t) =>
        deleteTarget(t ?? null),
      );
      velocity = createDouble(simWidth, simHeight);
      ink = createDouble(simWidth, simHeight);
      pressure = createDouble(simWidth, simHeight);
      divergence = createTarget(simWidth, simHeight);
      simTexel = [1 / simWidth, 1 / simHeight];
    };

    // Pointer position in canvas uv (the canvas overhangs the box by 10% each side).
    const toUv = () => ({
      u: (pointer.x + 0.1 * box.clientWidth) / (OVERSCAN * box.clientWidth),
      v: 1 - (pointer.y + 0.1 * box.clientHeight) / (OVERSCAN * box.clientHeight),
    });

    const step = (now: number) => {
      if (!gl || !programs || !velocity || !ink || !pressure || !divergence || !image) return;
      // Normalise to 60fps so 120Hz screens look the same.
      const k = lastFrame ? Math.min(2, Math.max(0.5, (now - lastFrame) / (1000 / 60))) : 1;
      lastFrame = now;
      const { splat, advect, divergence: div, pressure: pres, gradient, display } = programs;
      const aspect = box.clientWidth / Math.max(1, box.clientHeight);

      if (pointer.pending) {
        pointer.pending = false;
        const { u, v } = toUv();
        gl.useProgram(splat.program);
        gl.uniform1f(splat.uniforms.u_aspect ?? null, aspect);
        gl.uniform2f(splat.uniforms.u_point ?? null, u, v);
        gl.uniform1f(splat.uniforms.u_radius ?? null, radius);
        gl.uniform1i(splat.uniforms.u_target ?? null, bind(1, velocity.read.texture));
        gl.uniform3f(splat.uniforms.u_value ?? null, 6 * pointer.dx, -6 * pointer.dy, 0);
        draw(velocity.write);
        velocity.swap();
        gl.uniform1i(splat.uniforms.u_target ?? null, bind(1, ink.read.texture));
        gl.uniform3f(splat.uniforms.u_value ?? null, inkAmount, 0, 0);
        draw(ink.write);
        ink.swap();
        pointer.dx = 0;
        pointer.dy = 0;
      }

      gl.useProgram(div.program);
      gl.uniform2f(div.uniforms.u_texel ?? null, simTexel[0], simTexel[1]);
      gl.uniform1i(div.uniforms.u_velocity ?? null, bind(1, velocity.read.texture));
      draw(divergence);

      gl.useProgram(pres.program);
      gl.uniform2f(pres.uniforms.u_texel ?? null, simTexel[0], simTexel[1]);
      gl.uniform1i(pres.uniforms.u_divergence ?? null, bind(1, divergence.texture));
      for (let i = 0; i < PRESSURE_STEPS; i++) {
        gl.uniform1i(pres.uniforms.u_pressure ?? null, bind(2, pressure.read.texture));
        draw(pressure.write);
        pressure.swap();
      }

      gl.useProgram(gradient.program);
      gl.uniform2f(gradient.uniforms.u_texel ?? null, simTexel[0], simTexel[1]);
      gl.uniform1i(gradient.uniforms.u_pressure ?? null, bind(1, pressure.read.texture));
      gl.uniform1i(gradient.uniforms.u_velocity ?? null, bind(2, velocity.read.texture));
      draw(velocity.write);
      velocity.swap();

      gl.useProgram(advect.program);
      gl.uniform2f(advect.uniforms.u_texel ?? null, simTexel[0], simTexel[1]);
      gl.uniform1i(advect.uniforms.u_velocity ?? null, bind(1, velocity.read.texture));
      gl.uniform1i(advect.uniforms.u_source ?? null, bind(1, velocity.read.texture));
      gl.uniform1f(advect.uniforms.u_dt ?? null, k / 60);
      gl.uniform1f(advect.uniforms.u_dissipation ?? null, Math.pow(0.97, k));
      draw(velocity.write);
      velocity.swap();

      gl.uniform1i(advect.uniforms.u_velocity ?? null, bind(1, velocity.read.texture));
      gl.uniform1i(advect.uniforms.u_source ?? null, bind(2, ink.read.texture));
      gl.uniform1f(advect.uniforms.u_dt ?? null, (8 * k) / 60);
      gl.uniform1f(advect.uniforms.u_dissipation ?? null, Math.pow(0.98, k));
      draw(ink.write);
      ink.swap();

      gl.useProgram(display.program);
      gl.uniform2f(display.uniforms.u_texel ?? null, simTexel[0], simTexel[1]);
      gl.uniform1i(display.uniforms.u_image ?? null, bind(0, image));
      gl.uniform1i(display.uniforms.u_ink ?? null, bind(1, ink.read.texture));
      gl.uniform1i(display.uniforms.u_velocity ?? null, bind(2, velocity.read.texture));
      gl.uniform1f(display.uniforms.u_ratio ?? null, aspect);
      gl.uniform1f(display.uniforms.u_image_ratio ?? null, imageRatio);
      gl.uniform1f(display.uniforms.u_power ?? null, distortion);
      gl.uniform1f(display.uniforms.u_inner ?? null, INNER);
      draw(null);
      canvas.style.opacity = "1";
    };

    const loop = (now: number) => {
      step(now);
      if (!disposed && visible && now - lastMove < KEEP_RUNNING_MS) {
        frame = requestAnimationFrame(loop);
      } else {
        running = false;
        lastFrame = 0;
      }
    };

    const kick = () => {
      if (running || disposed || !programs || !image) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    const init = () => {
      started = true;
      gl =
        (canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }) as GL | null) ??
        (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }) as GL | null);
      if (!gl) return fail();
      try {
        formats = pickFormats();
        if (!formats) return fail();
        const quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        programs = {
          splat: link(SPLAT),
          advect: link(ADVECT),
          divergence: link(DIVERGENCE),
          pressure: link(PRESSURE),
          gradient: link(GRADIENT),
          display: link(DISPLAY),
        };
        sizeCanvas();
      } catch {
        return fail();
      }

      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (disposed || !gl) return;
        imageRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
        image = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        lastMove = performance.now();
        kick();
      };
      img.src = src;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || disposed) return;
      const rect = box.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if (!inside) {
        pointer.inside = false;
        return;
      }
      if (!pointer.inside) {
        // Entering: start from here instead of jumping from the last exit point.
        pointer.inside = true;
        pointer.x = x;
        pointer.y = y;
        if (!started) init();
        return;
      }
      pointer.dx += x - pointer.x;
      pointer.dy += y - pointer.y;
      pointer.x = x;
      pointer.y = y;
      pointer.pending = true;
      lastMove = performance.now();
      kick();
    };

    const onResize = () => {
      if (!gl || !programs || disposed) return;
      try {
        sizeCanvas();
      } catch {
        return fail();
      }
      lastMove = performance.now();
      kick();
    };

    const onLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      fail();
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(box);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) kick();
    });
    visibility.observe(box);
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src, cursorSize, cursorPower, distortion, resolution]);

  return (
    <div ref={boxRef} aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <canvas
        ref={canvasRef}
        className="absolute top-[-10%] left-[-10%] h-[120%] w-[120%] opacity-0 transition-opacity duration-300"
      />
    </div>
  );
}
