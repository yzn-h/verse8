import type { PlayerData } from "../config/types";
import { PLAYER_MAX_HP, PLAYER_SPEED } from "../config/constants";
import { PALETTE } from "../config/palette";
import { attachHealthLabel } from "../ui/healthLabel";
import { createHealthBar } from "../ui/healthBar";
import { lighten } from "../utils/color";

export const PLAYER_DATA: PlayerData = {
  kind: "player",
  speed: PLAYER_SPEED,
  maxHP: PLAYER_MAX_HP,
  facing: { x: 1, y: 0 },
};

export const createPlayer = (k: any) => {
  const player = k.add([
    k.pos(k.center()),
    k.rect(32, 32),
    k.color(...PALETTE.primary),
    k.outline(3, k.rgb(...lighten(PALETTE.primary, 0.35))),
    k.anchor("center"),
    k.area(),
    k.health(PLAYER_DATA.maxHP),
    "player",
    { data: { ...PLAYER_DATA }, _kbTween: null as any },
  ]);

  attachHealthLabel(k, player);
  createHealthBar(k, player);
  return player;
};
