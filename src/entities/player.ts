import type { PlayerData } from "../config/types";
import { PLAYER_MAX_HP, PLAYER_SPEED } from "../config/constants";
import { attachHealthLabel } from "../ui/healthLabel";

export const PLAYER_DATA: PlayerData = {
  kind: "player",
  speed: PLAYER_SPEED,
  maxHP: PLAYER_MAX_HP,
};

export const createPlayer = (k: any) => {
  const player = k.add([
    k.pos(k.center()),
    k.rect(32, 32),
    k.color(255, 255, 255),
    k.anchor("center"),
    k.area(),
    k.health(PLAYER_DATA.maxHP),
    "player",
    { data: { ...PLAYER_DATA }, _kbTween: null as any },
  ]);

  attachHealthLabel(k, player);
  return player;
};
