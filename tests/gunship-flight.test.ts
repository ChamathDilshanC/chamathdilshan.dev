import { describe, expect, it } from "vitest";
import { Frustum, Matrix4, PerspectiveCamera, Sphere, Vector3 } from "three";
import {
  FlightBounds,
  sampleScrollFlight as sampleInsertedFlight,
  scrollProgressForRoute,
  smoothFlightProgress,
  createFlight,
} from "../animation/gunship-flight";

const sampleScrollFlight: typeof sampleInsertedFlight = (p, frame, out) =>
  sampleInsertedFlight(scrollProgressForRoute(p), frame, out);
describe("gunship flight", () => {
  it("renders off-screen reset poses on fast scroll in either direction", () => {
    for (const [start, target] of [
      [0.79, 1],
      [0.85, 0.5],
    ]) {
      let p = scrollProgressForRoute(start!);
      const motion = { velocity: 0 };
      const samples: number[] = [];
      for (let i = 0; i < 120; i++) {
        p = smoothFlightProgress(
          p,
          scrollProgressForRoute(target!),
          1 / 60,
          motion,
        );
        samples.push(p);
      }
      expect(
        samples.some(
          (p) =>
            p >= scrollProgressForRoute(0.82) &&
            p <= scrollProgressForRoute(0.84),
        ),
      ).toBe(true);
      // The exact right hold is only needed if a frame skips the exit gap.
      expect(
        samples.some(
          (p) =>
            p >= scrollProgressForRoute(0.8) &&
            p < scrollProgressForRoute(0.82),
        ),
      ).toBe(true);
    }
  });
  const frame = {
    width: 22,
    depth: 15.2,
    mobile: false,
    left: -17,
    right: 17,
    dockX: 2,
    dockY: 4.3,
    dockZ: 1.7,
  };
  it.each([false, true])(
    "approaches the viewer, grows, and pitches upward (mobile=%s)",
    (mobile) => {
      const view = { ...frame, mobile, depth: mobile ? 22 : 15.2 };
      const entry = sampleInsertedFlight(0.35, view);
      const near = sampleInsertedFlight(0.415, view);
      const climb = sampleInsertedFlight(0.45, view);
      expect(near.z - entry.z).toBeGreaterThan(4);
      expect(near.proximity).toBeGreaterThan(0.65);
      expect(Math.abs(near.yaw)).toBeLessThan(0.13);
      expect(climb.y - near.y).toBeGreaterThan(1.5);
      expect(climb.pitch).toBeLessThan(-0.2);
      expect(Math.abs(climb.roll)).toBeGreaterThan(0.05);
    },
  );
  it.each([0.35, 0.415, 0.47, 0.52])(
    "joins the added fly-by continuously at %f",
    (p) => {
      const before = sampleInsertedFlight(p - 1e-6, frame);
      const after = sampleInsertedFlight(p + 1e-6, frame);
      for (const key of [
        "x",
        "y",
        "z",
        "yaw",
        "pitch",
        "roll",
        "proximity",
      ] as const)
        expect(Math.abs(before[key] - after[key])).toBeLessThan(0.002);
    },
  );
  it.each([
    0.32,
    0.405,
    0.458,
    0.565,
    scrollProgressForRoute(0.695),
    scrollProgressForRoute(0.745),
  ])("matches velocity through the curve join at %f", (p) => {
    const h = 0.000001;
    const before = sampleInsertedFlight(p - h, frame);
    const at = sampleInsertedFlight(p, frame);
    const after = sampleInsertedFlight(p + h, frame);
    for (const key of [
      "x",
      "y",
      "z",
      "yaw",
      "pitch",
      "roll",
      "proximity",
    ] as const) {
      const incoming = (at[key] - before[key]) / h;
      const outgoing = (after[key] - at[key]) / h;
      expect(Math.abs(incoming - outgoing), key).toBeLessThan(0.08);
    }
  });
  it.each([0.405, 0.458, scrollProgressForRoute(0.72)])(
    "keeps flying through the waypoint at %f",
    (p) => {
      const before = sampleInsertedFlight(p - 0.0001, frame);
      const after = sampleInsertedFlight(p + 0.0001, frame);
      expect(
        Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z) /
          0.0002,
      ).toBeGreaterThan(5);
    },
  );
  it("restores orbit, close approach, side pass, and parking to scroll", () => {
    const orbitA = sampleScrollFlight(0.15, frame);
    const orbitB = sampleScrollFlight(0.4, frame);
    expect(Math.abs(orbitA.x - orbitB.x)).toBeGreaterThan(1);
    expect(Math.abs(orbitA.z - orbitB.z)).toBeGreaterThan(1);
    expect(sampleScrollFlight(0.67, frame).stage).toBe("approach");
    expect(sampleScrollFlight(0.76, frame).stage).toBe("side-pass");
    expect(sampleScrollFlight(0.76, frame).x).toBeGreaterThan(0);
    expect(sampleScrollFlight(0.92, frame).stage).toBe("arrival");
    const parked = sampleScrollFlight(1, frame);
    expect([parked.x, parked.y, parked.z, parked.dock]).toEqual([
      2, 4.3, 1.7, 1,
    ]);
  });
  it("scrubs to the same pose in either direction without accumulating time", () => {
    const out = createFlight();
    const before = { ...sampleScrollFlight(0.35, frame, out) };
    for (const p of [0.7, 1, 0.92, 0.82, 0.81, 0.55, 0.35])
      sampleScrollFlight(p, frame, out);
    expect(out).toEqual(before);
  });
  it.each([0.56, 0.72, 0.8, 0.84, 0.985])(
    "joins the route continuously at %f",
    (p) => {
      const before = sampleScrollFlight(p - 1e-6, frame);
      const after = sampleScrollFlight(p + 1e-6, frame);
      for (const key of [
        "x",
        "y",
        "z",
        "yaw",
        "pitch",
        "roll",
        "scale",
      ] as const)
        expect(Math.abs(before[key] - after[key])).toBeLessThan(0.001);
    },
  );
  it.each([60, 120, 144])("smooths scroll consistently at %i Hz", (fps) => {
    let p = 0;
    const motion = { velocity: 0 };
    for (let i = 0; i < fps; i++)
      p = smoothFlightProgress(p, 0.7, 1 / fps, motion);
    expect(p).toBeCloseTo(0.7 * (1 - 11 * Math.exp(-10)), 10);
  });

  it.each([393 / 852, 768 / 1024, 1920 / 1080, 2560 / 1440, 3440 / 1440])(
    "wraps the whole bounding sphere outside the camera at aspect %f",
    (aspect) => {
      const camera = new PerspectiveCamera(52, aspect, 0.1, 100);
      camera.position.set(0.35, 3.4, 15.2);
      camera.lookAt(0, 2.5, 0);
      camera.updateMatrixWorld();
      const bounds = new FlightBounds();
      bounds.update(camera, aspect < 0.85 ? -0.2 : 3.7, 0, 4);
      const frustum = new Frustum().setFromProjectionMatrix(
        new Matrix4().multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse,
        ),
      );
      const sphere = new Sphere(
        new Vector3(bounds.right, aspect < 0.85 ? -0.2 : 3.7, 0),
        4,
      );
      expect(frustum.intersectsSphere(sphere)).toBe(false);
      const route = {
        ...frame,
        left: bounds.left,
        right: bounds.right,
        mobile: aspect < 0.85,
      };
      const before = sampleScrollFlight(0.82 - 1e-6, route);
      const after = sampleScrollFlight(0.82, route);
      sphere.center.set(before.x, before.y, before.z);
      expect(frustum.intersectsSphere(sphere)).toBe(false);
      sphere.center.set(after.x, after.y, after.z);
      expect(frustum.intersectsSphere(sphere)).toBe(false);
    },
  );
});
