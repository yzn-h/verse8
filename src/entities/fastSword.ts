import { PALETTE } from "../config/palette";
import type { FastSwordData } from "../config/types";
import { levelUpState } from "../systems/playerProgression";
import { isGameRunning } from "../systems/gameState";

export type FastSwordLevelDefinition = {
  level: number;
  name: string;
  description: string;
  slashCount: number;
  damage: number;
  cooldown: number;
  range: number;
  spacing: number;
  slashWidth: number;
  slashHeight: number;
  slashDuration: number;
  sequenceDelay: number;
};

export const FAST_SWORD_LEVELS: FastSwordLevelDefinition[] = [
  {
    level: 1,
    name: "Vento Slash",
    description: "Unleash three rapid slashes just ahead of the hunter.",
    slashCount: 3,
    damage: 2,
    cooldown: 0.9,
    range: 60,
    spacing: 34,
    slashWidth: 60,
    slashHeight: 20,
    slashDuration: 0.15,
    sequenceDelay: 0.05,
  },
  {
    level: 2,
    name: "Gale Edge",
    description: "Adds a fourth cut and tightens the cooldown.",
    slashCount: 4,
    damage: 3,
    cooldown: 0.75,
    range: 68,
    spacing: 34,
    slashWidth: 64,
    slashHeight: 22,
    slashDuration: 0.16,
    sequenceDelay: 0.05,
  },
  {
    level: 3,
    name: "Tempest Veil",
    description: "Five slashes sweep the front line with more force.",
    slashCount: 5,
    damage: 4,
    cooldown: 0.65,
    range: 76,
    spacing: 36,
    slashWidth: 68,
    slashHeight: 24,
    slashDuration: 0.17,
    sequenceDelay: 0.045,
  },
  {
    level: 4,
    name: "Vento Sacro",
    description: "Seven sacred gusts tear through anything in front.",
    slashCount: 7,
    damage: 5,
    cooldown: 0.55,
    range: 84,
    spacing: 38,
    slashWidth: 72,
    slashHeight: 26,
    slashDuration: 0.18,
    sequenceDelay: 0.04,
  },
];

const findLevelDef = (level: number) =>
  FAST_SWORD_LEVELS.find((def) => def.level === level) ?? null;

export const getNextFastSwordLevel = (currentLevel: number) => {
  if (currentLevel <= 0) return FAST_SWORD_LEVELS[0];
  return findLevelDef(currentLevel + 1);
};

export const applyFastSwordDefinition = (
  sword: any,
  def: FastSwordLevelDefinition
) => {
  sword.data.level = def.level;
  sword.data.active = true;
  sword.data.slashCount = def.slashCount;
  sword.data.damage = def.damage;
  sword.data.cooldown = def.cooldown;
  sword.data.range = def.range;
  sword.data.spacing = def.spacing;
  sword.data.slashWidth = def.slashWidth;
  sword.data.slashHeight = def.slashHeight;
  sword.data.slashDuration = def.slashDuration;
  sword.data.sequenceDelay = def.sequenceDelay;
  if (typeof sword.resetAttackTimer === "function") {
    sword.resetAttackTimer();
  }
};

export const FAST_SWORD_DATA: FastSwordData = {
  kind: "fastSword",
  level: 0,
  active: false,
  slashCount: 0,
  damage: 0,
  cooldown: 0.9,
  range: 60,
  spacing: 34,
  slashWidth: 60,
  slashHeight: 20,
  slashDuration: 0.15,
  sequenceDelay: 0.05,
};

const DEG_PER_RAD = 180 / Math.PI;

export const createFastSword = (k: any, player: any) => {
  const sword = k.add([
    k.pos(player.pos),
    {
      data: { ...FAST_SWORD_DATA },
      attackTimer: 0,
      slashColor: k.rgb(...PALETTE.ember),
      resetAttackTimer() {
        this.attackTimer = 0;
      },
    },
  ]);

  const spawnSlash = (
    offset: any,
    angleDeg: number,
    damage: number,
    duration: number
  ) => {
    const offsetVec = k.vec2(offset.x ?? 0, offset.y ?? 0);
    const initialPos = k.vec2(
      player.pos.x + offsetVec.x,
      player.pos.y + offsetVec.y
    );
    const slash = k.add([
      k.pos(initialPos),
      k.rect(sword.data.slashWidth, sword.data.slashHeight),
      k.anchor("center"),
      k.rotate(angleDeg),
      k.color(sword.slashColor),
      k.opacity(0.85),
      k.area(),
      "fastSwordSlash",
      {
        damage,
        life: duration,
        maxLife: duration,
        hitTargets: new Set<any>(),
        offset: offsetVec,
      },
    ]);

    slash.onUpdate(() => {
      if (!isGameRunning()) return;
      slash.life -= k.dt();
      if (slash.life <= 0) {
        k.destroy(slash);
        return;
      }
      slash.pos.x = player.pos.x + offsetVec.x;
      slash.pos.y = player.pos.y + offsetVec.y;
      slash.opacity = Math.max(0, slash.life / slash.maxLife);
    });
  };

  const beginAttack = () => {
    const facing = player.data?.facing ?? { x: 1, y: 0 };
    let forward = k.vec2(facing.x ?? 0, facing.y ?? 0);
    if (forward.len() === 0) {
      forward = k.vec2(1, 0);
    } else {
      forward = forward.unit();
    }

    let perp = k.vec2(-forward.y, forward.x);
    if (perp.len() === 0) {
      perp = k.vec2(0, 1);
    } else {
      perp = perp.unit();
    }

    const baseRangeX = forward.x * sword.data.range;
    const baseRangeY = forward.y * sword.data.range;
    const angleDeg = Math.atan2(forward.y, forward.x) * DEG_PER_RAD;
    const centerIndex = (sword.data.slashCount - 1) / 2;

    for (let i = 0; i < sword.data.slashCount; i += 1) {
      const delay = sword.data.sequenceDelay * i;
      const offset = i - centerIndex;
      const offsetX = perp.x * sword.data.spacing * offset;
      const offsetY = perp.y * sword.data.spacing * offset;
      const offsetVec = k.vec2(baseRangeX + offsetX, baseRangeY + offsetY);

      const scheduleSlash = () => {
        if (!isGameRunning()) return;
        if (!sword.data.active || levelUpState.active) return;
        spawnSlash(
          offsetVec,
          angleDeg,
          sword.data.damage,
          sword.data.slashDuration
        );
      };

      if (delay <= 0) {
        scheduleSlash();
      } else {
        k.wait(delay, scheduleSlash);
      }
    }
  };

  sword.onUpdate(() => {
    sword.pos = player.pos;
    if (!sword.data.active) return;
    if (!isGameRunning()) return;
    if (levelUpState.active) return;

    sword.attackTimer -= k.dt();
    if (sword.attackTimer > 0) return;

    beginAttack();
    sword.attackTimer = sword.data.cooldown;
  });

  return sword;
};
