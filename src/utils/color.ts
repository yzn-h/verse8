import { clamp } from "../utils/math";
import type { RGB } from "../config/types";

export const lighten = (color: RGB, amount: number): RGB => {
  const a = clamp(amount, 0, 1);
  return [
    clamp(Math.round(color[0] + (255 - color[0]) * a), 0, 255),
    clamp(Math.round(color[1] + (255 - color[1]) * a), 0, 255),
    clamp(Math.round(color[2] + (255 - color[2]) * a), 0, 255),
  ];
};
