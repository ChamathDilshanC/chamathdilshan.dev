import { Frustum, Matrix4, MathUtils, type PerspectiveCamera } from "three";

// Reused by the existing frame loop. A sphere contains every rotated model pose.
export class FlightBounds {
  private frustum = new Frustum();
  private matrix = new Matrix4();
  left = 0;
  right = 0;
  private edge(index: number, y: number, z: number, radius: number) {
    const plane = this.frustum.planes[index]!;
    return (
      (-radius -
        0.35 -
        plane.constant -
        plane.normal.y * y -
        plane.normal.z * z) /
      plane.normal.x
    );
  }
  update(camera: PerspectiveCamera, y: number, z: number, radius: number) {
    camera.updateMatrixWorld();
    this.frustum.setFromProjectionMatrix(
      this.matrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse,
      ),
    );
    this.left = this.edge(1, y, z, radius);
    this.right = this.edge(0, y, z, radius);
  }
}

// Insert a new fly-by without dropping any of the existing authored route.
export const FLYBY_START = 0.35;
export const FLYBY_END = 0.52;
export function scrollProgressForRoute(route: number) {
  return route <= FLYBY_START
    ? route
    : FLYBY_END + ((route - FLYBY_START) * (1 - FLYBY_END)) / (1 - FLYBY_START);
}
export function routeProgressFromScroll(scroll: number) {
  if (scroll <= FLYBY_START) return scroll;
  if (scroll < FLYBY_END) return FLYBY_START;
  return (
    FLYBY_START + ((scroll - FLYBY_END) * (1 - FLYBY_START)) / (1 - FLYBY_END)
  );
}
const WRAP = scrollProgressForRoute(0.82);
const EXIT = scrollProgressForRoute(0.8);
const ENTRY = scrollProgressForRoute(0.84);

export const arrivalAt = (progress: number) =>
  MathUtils.smootherstep(progress, 0.84, 0.985);

export function smoothFlightProgress(
  current: number,
  target: number,
  delta: number,
  motion?: { velocity: number },
) {
  const dt = Math.min(Math.max(delta, 0), 0.05);
  const goal = MathUtils.clamp(target, 0, 1);
  const offset = current - goal;
  const decay = Math.exp(-10 * dt);
  if (!motion) {
    const next = goal + offset * decay;
    if (current < WRAP && next >= WRAP)
      return scrollProgressForRoute(current < EXIT ? 0.81 : 0.83);
    if (current >= WRAP && next < WRAP)
      return scrollProgressForRoute(current > ENTRY ? 0.83 : 0.81);
    return next;
  }
  const step = (motion.velocity + 10 * offset) * dt;
  const raw = goal + (offset + step) * decay;
  const next = MathUtils.clamp(raw, 0, 1);
  motion.velocity = next === raw ? (motion.velocity - 10 * step) * decay : 0;
  // Render an invisible pose on both sides even if a fast scroll skips the gap.
  if (current < WRAP && next >= WRAP)
    return scrollProgressForRoute(current < EXIT ? 0.81 : 0.83);
  if (current >= WRAP && next < WRAP)
    return scrollProgressForRoute(current > ENTRY ? 0.83 : 0.81);
  return next;
}

export function createFlight() {
  return {
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    pitch: 0,
    proximity: 0,
    roll: 0,
    dock: 0,
    scale: 1,
    stage: "orbit",
  };
}

export type ScrollFlightFrame = {
  width: number;
  depth: number;
  mobile: boolean;
  left: number;
  right: number;
  dockX: number;
  dockY: number;
  dockZ: number;
};

// One scroll-authored route. There is no elapsed-time traversal competing with
// the scroll timeline: scrubbing back to a chapter returns to the same pose.
function sampleRoute(
  progress: number,
  frame: ScrollFlightFrame,
  out = createFlight(),
) {
  const p = MathUtils.clamp(progress, 0, 1);
  const { width, depth, mobile, left, right, dockX, dockY, dockZ } = frame;
  const phase = p * Math.PI * 2;
  const approach = MathUtils.smootherstep(p, 0.56, 0.72);
  const pass = MathUtils.smootherstep(p, 0.72, 0.8);
  const dock = arrivalAt(p);
  const baseY = mobile ? -2.6 : 3.15;
  const approachY = mobile ? -0.6 : 3.3;
  const exitY = mobile ? -0.2 : 3.7;
  const approachZ = Math.min(mobile ? 3.6 : 7.2, depth * 0.4);
  // Restore the original winding orbit and its depth/height changes.
  const orbitX =
    (Math.sin(phase) * 4.8 + Math.sin(phase * 2) * 0.65) *
    (mobile ? Math.min(0.52, width * 0.045) : 1);
  const orbitY = Math.sin(phase * 2 - 0.6) * (mobile ? 0.72 : 1.25);
  const orbitZ = mobile
    ? 2.4 + Math.cos(phase) * 1.1 + Math.sin(phase * 3) * 0.2
    : 1.2 + Math.cos(phase) * 2.4 + Math.sin(phase * 3) * 0.45;
  out.pitch = 0;
  out.proximity = 0;
  out.dock = dock;
  out.scale = MathUtils.lerp(1, 0.32, dock);
  if (p < 0.72) {
    out.stage = p < 0.56 ? "orbit" : "approach";
    out.x = MathUtils.lerp(orbitX, 0, approach);
    out.y = MathUtils.lerp(baseY + orbitY, approachY, approach);
    out.z = MathUtils.lerp(orbitZ, approachZ, approach);
    out.yaw = MathUtils.lerp(
      -0.6 + Math.cos(phase) * 0.16 + Math.sin(p * Math.PI * 6) * 0.22,
      Math.PI / 2 - 0.18,
      approach,
    );
    out.roll =
      (Math.cos(phase) * 0.2 - Math.sin(phase * 2) * 0.07) * (1 - approach);
    out.pitch = -Math.cos(phase * 2 - 0.6) * 0.09 * (1 - approach);
  } else if (p < 0.82) {
    out.stage = "side-pass";
    out.x = MathUtils.lerp(0, right, pass);
    out.y = MathUtils.lerp(approachY, exitY, pass);
    out.z = MathUtils.lerp(approachZ, 0, pass);
    out.yaw = Math.PI / 2 - 0.18;
    out.roll = -Math.sin(pass * Math.PI) * 0.22;
    out.pitch = -Math.sin(pass * Math.PI) * 0.07;
  } else {
    // Both endpoints lie beyond the complete model's bounding sphere. Hold
    // outside the view on each side of 0.82; never damp across this reset.
    out.stage = dock === 1 ? "parked" : "arrival";
    out.x = MathUtils.lerp(left, dockX, dock);
    out.y = MathUtils.lerp(exitY, dockY, dock);
    out.z = MathUtils.lerp(0, dockZ, dock);
    out.yaw = Math.PI / 2 - 0.18;
    out.roll = Math.sin(dock * Math.PI) * 0.12;
    out.pitch = -Math.sin(dock * Math.PI) * 0.08;
  }
  return out;
}

const flightFields = [
  "x",
  "y",
  "z",
  "yaw",
  "pitch",
  "roll",
  "proximity",
  "scale",
  "dock",
] as const;
type FlightPose = ReturnType<typeof createFlight>;
export function createFlightCurve() {
  return {
    points: Array.from({ length: 4 }, createFlight),
    velocities: Array.from({ length: 4 }, createFlight),
    accelerations: Array.from({ length: 4 }, createFlight),
    before: createFlight(),
    after: createFlight(),
  };
}
type FlightCurve = ReturnType<typeof createFlightCurve>;
const flybyKnots = [0.32, 0.405, 0.458, 0.565] as const;
const turnKnots = [
  scrollProgressForRoute(0.695),
  scrollProgressForRoute(0.745),
] as const;

// A quintic Hermite segment matches position, velocity AND acceleration at
// both ends. Shared tangents prevent every waypoint becoming a stop/start.
function quintic(
  t: number,
  span: number,
  p0: number,
  p1: number,
  v0: number,
  v1: number,
  a0: number,
  a1: number,
) {
  const c1 = v0 * span;
  const c2 = (a0 * span * span) / 2;
  const d = p1 - p0 - c1 - c2;
  const e = v1 * span - c1 - 2 * c2;
  const f = a1 * span * span - 2 * c2;
  const c3 = 10 * d - 4 * e + f / 2;
  const c4 = -15 * d + 7 * e - f;
  const c5 = 6 * d - 3 * e + f / 2;
  return p0 + t * (c1 + t * (c2 + t * (c3 + t * (c4 + t * c5))));
}
function boundary(
  curve: FlightCurve,
  index: number,
  p: number,
  frame: ScrollFlightFrame,
) {
  const epsilon = 0.00001;
  const point = sampleRoute(
    routeProgressFromScroll(p),
    frame,
    curve.points[index]!,
  );
  sampleRoute(routeProgressFromScroll(p - epsilon), frame, curve.before);
  sampleRoute(routeProgressFromScroll(p + epsilon), frame, curve.after);
  for (const field of flightFields) {
    curve.velocities[index]![field] =
      (curve.after[field] - curve.before[field]) / (2 * epsilon);
    curve.accelerations[index]![field] =
      (curve.after[field] - 2 * point[field] + curve.before[field]) /
      (epsilon * epsilon);
  }
}
function curveSample(
  p: number,
  knots: readonly number[],
  curve: FlightCurve,
  out: FlightPose,
) {
  let i = 0;
  while (i < knots.length - 2 && p > knots[i + 1]!) i++;
  const span = knots[i + 1]! - knots[i]!;
  const t = MathUtils.clamp((p - knots[i]!) / span, 0, 1);
  for (const field of flightFields) {
    out[field] = quintic(
      t,
      span,
      curve.points[i]![field],
      curve.points[i + 1]![field],
      curve.velocities[i]![field],
      curve.velocities[i + 1]![field],
      curve.accelerations[i]![field],
      curve.accelerations[i + 1]![field],
    );
  }
}

export function sampleScrollFlight(
  progress: number,
  frame: ScrollFlightFrame,
  out = createFlight(),
  curve = createFlightCurve(),
) {
  sampleRoute(routeProgressFromScroll(progress), frame, out);
  if (progress > turnKnots[0] && progress < turnKnots[1]) {
    boundary(curve, 0, turnKnots[0], frame);
    boundary(curve, 1, turnKnots[1], frame);
    curveSample(progress, turnKnots, curve, out);
    return out;
  }
  if (progress <= flybyKnots[0] || progress >= flybyKnots[3]) return out;
  boundary(curve, 0, flybyKnots[0], frame);
  boundary(curve, 3, flybyKnots[3], frame);
  const near = curve.points[1]!;
  const crest = curve.points[2]!;
  for (const field of flightFields) {
    near[field] = curve.points[0]![field];
    crest[field] = curve.points[3]![field];
  }
  near.x = 0;
  near.y = frame.mobile ? 1.4 : 2.9;
  near.z = frame.depth * (frame.mobile ? 0.36 : 0.44);
  near.yaw = 0;
  near.pitch = -0.1;
  near.roll = 0.035;
  near.proximity = frame.mobile ? 0.7 : 0.8;
  crest.x = frame.mobile ? -0.6 : -1.2;
  crest.y = frame.mobile ? 4.7 : 5.8;
  crest.z = near.z * 0.64;
  crest.yaw = 0;
  crest.pitch = -0.24;
  crest.roll = 0.14;
  crest.proximity = near.proximity * 0.65;
  for (let i = 1; i <= 2; i++) {
    for (const field of flightFields) {
      const before =
        (curve.points[i]![field] - curve.points[i - 1]![field]) /
        (flybyKnots[i]! - flybyKnots[i - 1]!);
      const after =
        (curve.points[i + 1]![field] - curve.points[i]![field]) /
        (flybyKnots[i + 1]! - flybyKnots[i]!);
      // Monotone tangents avoid angle/scale overshoot while the position moves
      // through a continuous 3D arc (only an individual axis turns at a crest).
      curve.velocities[i]![field] =
        before * after > 0 ? (2 * before * after) / (before + after) : 0;
      curve.accelerations[i]![field] = 0;
    }
  }
  curveSample(progress, flybyKnots, curve, out);
  out.stage =
    progress < flybyKnots[1]
      ? "flyby-approach"
      : progress < flybyKnots[2]
        ? "flyby-climb"
        : "flyby-rejoin";
  return out;
}

export function cybertronLayout(
  width: number,
  mobile: boolean,
  target = { x: 0, y: 0, z: -3, radius: 0 },
) {
  target.radius = Math.min(3.5, width * 0.29);
  target.x = mobile ? 0 : width * 0.2;
  target.y = mobile ? 1.4 : 2.2;
  return target;
}
