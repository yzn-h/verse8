import { randRange } from "../utils/math";

export const unitVec = (k: any, v: any) =>
  v?.len && v.len() > 0 ? v.unit() : k.vec2(0, 0);

export const lerpVec = (k: any, from: any, to: any, t: number) =>
  k.vec2(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);

export const jitterVec = (k: any, v: any, jitter = 0) => {
  if (!jitter) return k.vec2(v.x, v.y);
  return k.vec2(
    v.x + randRange(-jitter, jitter),
    v.y + randRange(-jitter, jitter)
  );
};
