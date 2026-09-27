export type CharacterAction =
  | "Idle"
  | "Walk"
  | "Run"
  | "Turn"
  | "Look Around"
  | "Sword Draw"
  | "Sword Sheathe"
  | "Light Attack"
  | "Heavy Attack"
  | "Dodge"
  | "Block"
  | "Kneel"
  | "Stand";
export const actions: CharacterAction[] = [
  "Idle",
  "Walk",
  "Run",
  "Turn",
  "Look Around",
  "Sword Draw",
  "Sword Sheathe",
  "Light Attack",
  "Heavy Attack",
  "Dodge",
  "Block",
  "Kneel",
  "Stand",
];
export function actionAt(progress: number): CharacterAction {
  if (progress < 0.035) return "Idle";
  if (progress < 0.075) return "Turn";
  if (progress < 0.32) return "Walk";
  if (progress < 0.35) return "Look Around";
  if (progress < 0.4) return "Sword Draw";
  if (progress < 0.425) return "Block";
  if (progress < 0.455) return "Light Attack";
  if (progress < 0.485) return "Dodge";
  if (progress < 0.515) return "Heavy Attack";
  if (progress < 0.55) return "Sword Sheathe";
  if (progress < 0.82) return "Walk";
  if (progress < 0.89) return "Kneel";
  if (progress < 0.92) return "Stand";
  return "Idle";
}
export function phaseAt(p: number) {
  if (p < 0.075) return "INTRO";
  if (p < 0.35) return "WALKING";
  if (p < 0.55) return "COMBAT_TRANSITION";
  if (p < 0.7) return "SKILLS";
  if (p < 0.82) return "EXPERIENCE";
  if (p < 0.92) return "ABOUT";
  return "CONTACT";
}
