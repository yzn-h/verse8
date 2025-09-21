import type { RGB } from "./types";

export const PALETTE = {
  text: [249, 245, 240] as RGB,
  background: [11, 8, 4] as RGB,
  primary: [198, 130, 57] as RGB,
  secondary: [101, 65, 26] as RGB,
  accent: [157, 96, 32] as RGB,
  dune: [217, 176, 124] as RGB,
  ember: [229, 148, 63] as RGB,
} as const;

export type PaletteKey = keyof typeof PALETTE;
