"use client";

import { useEffect, useRef } from "react";

type Star = {
  angle: number;
  radius: number;
  arm: number;
  size: number;
  alpha: number;
  warmth: number;
  depth: number;
};

type BackgroundStar = {
  x: number;
  y: number;
  size: number;
  alpha: number;
};

const TAU = Math.PI * 2;
const ARM_COUNT = 5;

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function createStars(width: number, height: number) {
  const random = seededRandom(Math.round(width * 13 + height * 7));
  const count = Math.min(980, Math.max(520, Math.round((width * height) / 1800)));
  const galaxyRadius = Math.min(width, height) * 0.46;
  const stars: Star[] = [];

  for (let i = 0; i < count; i += 1) {
    const distance = Math.pow(random(), 0.56) * galaxyRadius;
    const arm = Math.floor(random() * ARM_COUNT);
    stars.push({
      angle: random() * TAU,
      radius: distance,
      arm,
      size: random() > 0.93 ? 1.8 + random() * 2.6 : 0.35 + random() * 1.45,
      alpha: 0.25 + random() * 0.75,
      warmth: random(),
      depth: 0.72 + random() * 0.55,
    });
  }

  const backgroundStars = Array.from({ length: Math.round(width / 7) }, () => ({
    x: random() * width,
    y: random() * height,
    size: 0.25 + random() * 0.9,
    alpha: 0.18 + random() * 0.46,
  }));

  return { stars, backgroundStars, galaxyRadius };
}

export function GalaxyScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let backgroundStars: BackgroundStar[] = [];
    let galaxyRadius = 0;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pointerX = 0;
    let pointerY = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      ({ stars, backgroundStars, galaxyRadius } = createStars(width, height));
    };

    const draw = (time: number) => {
      if (!width || !height) return;

      const seconds = reducedMotion ? 0 : time / 1000;
      const centerX = width * 0.56 + pointerX * 18;
      const centerY = height * 0.52 + pointerY * 12;
      const rotation = seconds * 0.055;

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#05080c";
      context.fillRect(0, 0, width, height);

      for (const star of backgroundStars) {
        context.beginPath();
        context.fillStyle = `rgba(185, 217, 255, ${star.alpha})`;
        context.arc(star.x, star.y, star.size, 0, TAU);
        context.fill();
      }

      const aura = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, galaxyRadius * 1.18);
      aura.addColorStop(0, "rgba(255, 248, 224, 0.35)");
      aura.addColorStop(0.08, "rgba(198, 224, 255, 0.15)");
      aura.addColorStop(0.3, "rgba(56, 122, 188, 0.06)");
      aura.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = aura;
      context.fillRect(0, 0, width, height);

      for (const star of stars) {
        const armAngle = (star.arm / ARM_COUNT) * TAU;
        const spiralAngle = armAngle + star.radius / Math.max(galaxyRadius, 1) * 4.8 + star.angle * 0.22 + rotation;
        const spread = (1 - star.radius / Math.max(galaxyRadius, 1)) * 0.6 + 0.08;
        const x = centerX + Math.cos(spiralAngle) * star.radius * star.depth + Math.cos(star.angle) * star.radius * spread;
        const y = centerY + Math.sin(spiralAngle) * star.radius * 0.66 * star.depth + Math.sin(star.angle) * star.radius * spread * 0.42;
        const pulse = reducedMotion ? 1 : 0.92 + Math.sin(seconds * 1.6 + star.radius) * 0.12;
        const size = star.size * pulse;
        const color = star.warmth > 0.86 ? "255, 221, 183" : star.warmth > 0.52 ? "211, 232, 255" : "169, 207, 255";

        if (size > 2.1) {
          const glow = context.createRadialGradient(x, y, 0, x, y, size * 7);
          glow.addColorStop(0, `rgba(${color}, ${star.alpha * 0.9})`);
          glow.addColorStop(1, `rgba(${color}, 0)`);
          context.fillStyle = glow;
          context.beginPath();
          context.arc(x, y, size * 7, 0, TAU);
          context.fill();
        }

        context.beginPath();
        context.fillStyle = `rgba(${color}, ${star.alpha})`;
        context.arc(x, y, size, 0, TAU);
        context.fill();
      }

      const core = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, galaxyRadius * 0.18);
      core.addColorStop(0, "rgba(255,255,255,0.98)");
      core.addColorStop(0.08, "rgba(255,248,225,0.72)");
      core.addColorStop(0.32, "rgba(172,202,238,0.16)");
      core.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = core;
      context.fillRect(centerX - galaxyRadius * 0.18, centerY - galaxyRadius * 0.18, galaxyRadius * 0.36, galaxyRadius * 0.36);

      if (!reducedMotion) frameRef.current = requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left - rect.width / 2) / rect.width;
      pointerY = (event.clientY - rect.top - rect.height / 2) / rect.height;
    };

    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion && frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (!reducedMotion) frameRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    if (!reducedMotion) frameRef.current = requestAnimationFrame(draw);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    motionQuery.addEventListener("change", onMotionChange);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
