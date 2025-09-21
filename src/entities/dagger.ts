import type { DaggerData } from "../config/types";
import {
  DAGGER_DAMAGE,
  DAGGER_DISTANCE,
  DAGGER_ROT_SPEED,
} from "../config/constants";
import { levelUpState } from "../systems/playerProgression";

export const DAGGER_DATA: DaggerData = {
  kind: "dagger",
  damage: DAGGER_DAMAGE,
  rotSpeed: DAGGER_ROT_SPEED,
  distance: DAGGER_DISTANCE,
};

export const createDagger = (k: any, player: any) => {
  const dagger = k.add([
    k.pos(player.pos),
    k.rect(24, 8),
    k.color(255, 0, 0),
    k.anchor("center"),
    k.rotate(0),
    k.area(),
    "dagger",
    { data: { ...DAGGER_DATA } },
  ]);

  dagger.onUpdate(() => {
    if (levelUpState.active) return;
    dagger.angle += dagger.data.rotSpeed * k.dt();
    const offset = k.Vec2.fromAngle(dagger.angle).scale(dagger.data.distance);
    dagger.pos = player.pos.add(offset);
  });

  return dagger;
};
