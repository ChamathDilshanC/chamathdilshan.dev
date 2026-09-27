export type Actor = "sorceress" | "necromancer" | "fighter";
export type ModelAction = "cast" | "dodge" | "fire" | "roll";
export type ActionRequest = {
  actor: Actor;
  kind: ModelAction;
  started: number;
  id: number;
};

export const actionDuration: Record<ModelAction, number> = {
  cast: 2.8,
  dodge: 1.5,
  fire: 2.2,
  roll: 2.4,
};
export function actorAt(p: number): Actor {
  if (p >= 0.35 && p < 0.55) return "fighter";
  if ((p >= 0.15 && p < 0.35) || (p >= 0.7 && p < 0.92)) return "necromancer";
  return "sorceress";
}
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => {
  const t = clamp(v);
  return t * t * (3 - 2 * t);
};

// Time-based poses always return to neutral; they are independent of frame rate.
export function actionPose(kind: ModelAction, elapsed: number) {
  const duration = actionDuration[kind];
  const t = clamp(elapsed / duration);
  const envelope = Math.sin(t * Math.PI) ** 2;
  const pose = {
    x: 0,
    y: 0,
    z: 0,
    pitch: 0,
    yaw: 0,
    roll: 0,
    charge: 0,
    release: 0,
    fire: 0,
  };
  if (elapsed < 0 || elapsed >= duration) return pose;
  if (kind === "cast") {
    const charge = smooth(t / 0.38) * (1 - smooth((t - 0.42) / 0.25));
    const strike = Math.sin(clamp((t - 0.38) / 0.32) * Math.PI);
    pose.y = envelope * 0.42;
    pose.z = -charge * 0.25 + strike * 0.65;
    pose.pitch = charge * -0.065 + strike * 0.1;
    pose.yaw = -charge * 0.22 + strike * 0.22;
    pose.charge = charge;
    pose.release = t > 0.42 ? clamp((t - 0.42) / 0.55) : 0;
  } else if (kind === "dodge") {
    pose.x = Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI) * 1.9;
    pose.y = envelope * 0.28;
    pose.roll = -pose.x * 0.13;
    pose.yaw = Math.sin(t * Math.PI * 2) * 0.45;
  } else if (kind === "roll") {
    pose.roll = smooth(t) * Math.PI * 2;
    pose.x = Math.sin(t * Math.PI * 2) * 1.1;
    pose.y = envelope * 0.75;
    pose.z = envelope * 0.6;
  } else {
    pose.fire = t > 0.12 && t < 0.8 ? 1 : 0;
    pose.z = -Math.abs(Math.sin(t * Math.PI * 9)) * envelope * 0.12;
    pose.pitch = envelope * -0.04;
  }
  return pose;
}
