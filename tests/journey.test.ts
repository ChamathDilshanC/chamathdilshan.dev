import { describe, expect, it } from "vitest";
import { sampleShot, shots } from "../animation/camera-director";
import { actionAt, phaseAt } from "../animation/character-animations";
import { portfolio } from "../config/portfolio";
describe("authored journey", () => {
  it("has finite, continuous camera rails at every shot boundary", () => {
    for (const shot of shots) {
      const before = sampleShot(shot.at - 0.00001);
      const after = sampleShot(shot.at + 0.00001);
      expect(before.position.every(Number.isFinite)).toBe(true);
      before.position.forEach((value, i) =>
        expect(Math.abs(value - after.position[i]!)).toBeLessThan(0.02),
      );
    }
    expect(sampleShot(-1).position).toEqual(shots[0]!.position);
    expect(sampleShot(2).position).toEqual(shots.at(-1)!.position);
  });
  it("keeps combat within its short transition and reaches the summit", () => {
    expect(actionAt(0)).toBe("Idle");
    expect(actionAt(0.2)).toBe("Walk");
    expect(phaseAt(0.45)).toBe("COMBAT_TRANSITION");
    expect(actionAt(0.6)).toBe("Walk");
    expect(phaseAt(1)).toBe("CONTACT");
    expect(actionAt(1)).toBe("Idle");
  });
  it("has unique deep-link targets and complete case-study content", () => {
    expect(new Set(portfolio.chapters.map((c) => c.id)).size).toBe(6);
    expect(new Set(portfolio.projects.map((p) => p.id)).size).toBe(4);
    portfolio.projects.forEach((p) => {
      expect(p.problem.length).toBeGreaterThan(20);
      expect(p.solution.length).toBeGreaterThan(20);
      expect(p.architecture.length).toBeGreaterThan(2);
    });
  });
});
