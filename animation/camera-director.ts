export type Vec3 = [number, number, number];
export type CameraShot = {
  at: number;
  position: Vec3;
  target: Vec3;
  fov: number;
};
export const shots: CameraShot[] = [
  { at: 0, position: [0, 3.1, 12.8], target: [-1.1, 2.4, 0], fov: 43 },
  { at: 0.15, position: [1.1, 3.4, 13], target: [-0.7, 2.4, 0], fov: 44 },
  { at: 0.3, position: [-0.8, 3, 12.4], target: [-1.2, 2.3, 0], fov: 44 },
  { at: 0.4, position: [3.8, 4.9, 13], target: [1.1, 2, 0], fov: 49 },
  { at: 0.5, position: [-1.5, 4.1, 13.8], target: [0.3, 2, 0], fov: 48 },
  { at: 0.6, position: [0, 3.1, 12.8], target: [-1.1, 2.4, 0], fov: 44 },
  { at: 0.74, position: [1.4, 3.5, 13.3], target: [-0.8, 2.4, 0], fov: 44 },
  { at: 0.84, position: [-1, 3.2, 12.8], target: [-1.3, 2.2, 0], fov: 44 },
  { at: 0.94, position: [0, 3.3, 13.2], target: [-1, 2.4, 0], fov: 44 },
  { at: 1, position: [0.8, 3.6, 14], target: [-1, 2.4, 0], fov: 45 },
];
export function sampleShot(progress: number): CameraShot {
  const p = Math.max(0, Math.min(1, progress));
  const index = Math.max(0, shots.findIndex((shot) => shot.at >= p) - 1);
  const a = shots[index]!;
  const b = shots[index + 1] ?? a;
  const t = Math.max(0, Math.min(1, (p - a.at) / (b.at - a.at || 1)));
  const ease = t * t * (3 - 2 * t);
  const mix = (x: number, y: number) => x + (y - x) * ease;
  return {
    at: p,
    position: a.position.map((v, i) => mix(v, b.position[i]!)) as Vec3,
    target: a.target.map((v, i) => mix(v, b.target[i]!)) as Vec3,
    fov: mix(a.fov, b.fov),
  };
}
