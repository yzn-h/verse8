import type { DaggerData } from "../config/types";
import {
  DAGGER_DAMAGE,
  DAGGER_DISTANCE,
  DAGGER_ROT_SPEED,
} from "../config/constants";
import { PALETTE } from "../config/palette";
import { levelUpState } from "../systems/playerProgression";
import { isGameRunning } from "../systems/gameState";
import { lighten } from "../utils/color";

export type DaggerLevelDefinition = {
  level: number;
  name: string;
  description: string;
  count: number;
  damage: number;
  rotSpeed: number;
  distance: number;
};

export const DAGGER_LEVELS: DaggerLevelDefinition[] = [
  {
    level: 1,
    name: "Orbiting Knife",
    description: "A single dagger circles the player.",
    count: 1,
    damage: DAGGER_DAMAGE,
    rotSpeed: DAGGER_ROT_SPEED,
    distance: DAGGER_DISTANCE,
  },
  {
    level: 2,
    name: "Twin Daggers",
    description:
      "Adds a second blade opposite the first with more speed, reach, and damage.",
    count: 2,
    damage: DAGGER_DAMAGE + 1,
    rotSpeed: DAGGER_ROT_SPEED + 60,
    distance: DAGGER_DISTANCE + 24,
  },
  {
    level: 3,
    name: "Quad Spin",
    description:
      "Summons two more daggers for a four-blade ring with higher damage and speed.",
    count: 4,
    damage: DAGGER_DAMAGE + 2,
    rotSpeed: DAGGER_ROT_SPEED + 120,
    distance: DAGGER_DISTANCE + 48,
  },
  {
    level: 4,
    name: "Blade Storm",
    description:
      "Fills the orbit with six daggers that strike harder, faster, and farther.",
    count: 6,
    damage: DAGGER_DAMAGE + 3,
    rotSpeed: DAGGER_ROT_SPEED + 180,
    distance: DAGGER_DISTANCE + 72,
  },
];

const findLevelDef = (level: number) =>
  DAGGER_LEVELS.find((def) => def.level === level);

export const getNextDaggerLevel = (currentLevel: number) =>
  findLevelDef(currentLevel + 1) ?? null;

export const applyDaggerLevel = (dagger: any, level: number) => {
  const def = findLevelDef(level);
  if (!def) return;
  applyDaggerDefinition(dagger, def);
};

export const applyDaggerDefinition = (
  dagger: any,
  def: DaggerLevelDefinition
) => {
  dagger.data.level = def.level;
  dagger.data.count = def.count;
  dagger.data.damage = def.damage;
  dagger.data.rotSpeed = def.rotSpeed;
  dagger.data.distance = def.distance;
  dagger.syncBladeLayout?.();
};

export const DAGGER_DATA: DaggerData = {
  kind: "dagger",
  damage: DAGGER_DAMAGE,
  rotSpeed: DAGGER_ROT_SPEED,
  distance: DAGGER_DISTANCE,
  level: 1,
  count: 1,
};

export const createDagger = (k: any, player: any) => {
  const dagger = k.add([
    k.pos(player.pos),
    {
      data: { ...DAGGER_DATA },
      blades: [] as any[],
      bladeOffsets: [] as number[],
      rotation: 0,
      syncBladeLayout: () => {},
    },
  ]);

  const spawnBlade = () => {
    const outline = lighten(PALETTE.accent, 0.25);
    return k.add([
      k.rect(24, 8),
      k.color(...PALETTE.accent),
      k.outline(2, k.rgb(...outline)),
      k.anchor("center"),
      k.rotate(0),
      k.area(),
      "dagger",
      { controller: dagger },
    ]);
  };

  const updateOffsets = () => {
    dagger.bladeOffsets = [];
    const count = Math.max(1, dagger.data.count);
    const step = 360 / count;
    for (let i = 0; i < count; i += 1) {
      dagger.bladeOffsets.push(step * i);
    }
  };

  const syncBladeLayout = () => {
    const desired = Math.max(1, dagger.data.count);
    while (dagger.blades.length < desired) {
      const blade = spawnBlade();
      dagger.blades.push(blade);
    }
    while (dagger.blades.length > desired) {
      const blade = dagger.blades.pop();
      if (blade) {
        k.destroy(blade);
      }
    }
    updateOffsets();
  };

  dagger.syncBladeLayout = syncBladeLayout;

  applyDaggerLevel(dagger, DAGGER_DATA.level);
  syncBladeLayout();

  dagger.onUpdate(() => {
    dagger.pos = player.pos;
    if (!isGameRunning()) return;
    if (levelUpState.active) return;

    dagger.rotation += dagger.data.rotSpeed * k.dt();

    const offsets = dagger.bladeOffsets;
    dagger.blades.forEach((blade: any, index: number) => {
      const angle = dagger.rotation + (offsets[index] ?? 0);
      const offset = k.Vec2.fromAngle(angle).scale(dagger.data.distance);
      blade.pos = player.pos.add(offset);
      blade.angle = angle;
    });
  });

  return dagger;
};
