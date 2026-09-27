import { describe, expect, it } from "vitest";
import {
  actionDuration,
  actionPose,
  actorAt,
  type ModelAction,
} from "../animation/model-actions";

describe("model choreography", () => {
  it("selects the visible actor at chapter boundaries", () => {
    expect([0, 0.15, 0.35, 0.55, 0.7, 0.92].map(actorAt)).toEqual([
      "sorceress",
      "necromancer",
      "fighter",
      "sorceress",
      "necromancer",
      "sorceress",
    ]);
  });
  it("keeps every action finite and settles to a neutral pose", () => {
    for (const kind of Object.keys(actionDuration) as ModelAction[]) {
      const end = actionDuration[kind];
      expect(Object.values(actionPose(kind, -1)).every((v) => v === 0)).toBe(
        true,
      );
      expect(Object.values(actionPose(kind, end)).every((v) => v === 0)).toBe(
        true,
      );
      for (let t = 0; t <= end; t += 1 / 60)
        expect(Object.values(actionPose(kind, t)).every(Number.isFinite)).toBe(
          true,
        );
      const before = actionPose(kind, end - 0.00001);
      // A completed roll differs by one full turn, which is the same orientation.
      expect(Math.abs(Math.sin(before.roll))).toBeLessThan(0.001);
      expect(
        Math.abs(before.x) + Math.abs(before.y) + Math.abs(before.z),
      ).toBeLessThan(0.001);
    }
  });
  it("charges before releasing a spell and gates cannon bursts", () => {
    expect(actionPose("cast", 0.9).charge).toBeGreaterThan(0.8);
    expect(actionPose("cast", 0.9).release).toBe(0);
    expect(actionPose("cast", 1.8).release).toBeGreaterThan(0);
    expect(actionPose("fire", 0).fire).toBe(0);
    expect(actionPose("fire", 1).fire).toBe(1);
    expect(actionPose("fire", 2.1).fire).toBe(0);
    expect(actionPose("roll", 1.2).roll).toBeCloseTo(Math.PI);
  });
});
