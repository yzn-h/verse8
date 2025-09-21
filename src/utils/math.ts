export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const randRange = (min: number, max: number) => min + Math.random() * (max - min);

export const distribute = (idx: number, count: number) =>
  (count <= 1 ? 0.5 : idx / (count - 1));
