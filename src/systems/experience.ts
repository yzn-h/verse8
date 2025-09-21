import {
  EXP_MAGNET_BASE_SPEED,
  EXP_MAGNET_SPEED_GROWTH,
} from "../config/constants";
import { PALETTE } from "../config/palette";
import type { ExpShardComp, ExpTierDef, RGB } from "../config/types";
import { lighten } from "../utils/color";
import { clamp, randRange } from "../utils/math";
import { lerpVec } from "../utils/vector";
import { playerStats } from "./playerProgression";
import { isGameRunning } from "./gameState";

const EXP_TIER_DEFS: ExpTierDef[] = [
  { value: 25, color: PALETTE.ember, radius: 12 },
  { value: 5, color: PALETTE.primary, radius: 9 },
  { value: 1, color: PALETTE.accent, radius: 7 },
];

const expTierForValue = (value: number): ExpTierDef => {
  for (const tier of EXP_TIER_DEFS) {
    if (value >= tier.value) {
      return tier;
    }
  }
  return EXP_TIER_DEFS[EXP_TIER_DEFS.length - 1];
};

const distributeExp = (amount: number): number[] => {
  const drops: number[] = [];
  let remaining = Math.floor(amount);
  if (remaining <= 0) return drops;

  const sorted = [...EXP_TIER_DEFS].sort((a, b) => b.value - a.value);
  for (const tier of sorted) {
    while (remaining >= tier.value) {
      drops.push(tier.value);
      remaining -= tier.value;
    }
  }

  if (remaining > 0) {
    drops.push(remaining);
  }

  return drops;
};

export const spawnExpShard = (k: any, player: any, value: number, origin: any) => {
  const tier = expTierForValue(value);
  const outline = lighten(tier.color as RGB, 0.4);
  const outlineColor = k.rgb(outline[0], outline[1], outline[2]);
  const basePos = origin.clone
    ? origin.clone()
    : k.vec2(origin.x ?? 0, origin.y ?? 0);
  const spawnPos = k.vec2(
    basePos.x + randRange(-18, 18),
    basePos.y + randRange(-18, 18)
  );

  const points = [
    k.vec2(0, -tier.radius),
    k.vec2(tier.radius * 0.9, tier.radius),
    k.vec2(-tier.radius * 0.9, tier.radius),
  ];
  const colliderShape = new k.Polygon(points);

  const shard = k.add([
    k.pos(spawnPos),
    k.anchor("center"),
    k.polygon(points),
    k.color(...tier.color),
    k.outline(2, outlineColor),
    k.rotate(randRange(0, 360)),
    k.area({ shape: colliderShape, collisionIgnore: ["expShard"] }),
    "expShard",
    {
      expValue: value,
      magnetized: false,
      magnetTime: 0,
    } as ExpShardComp,
  ]);

  shard.onUpdate(() => {
    if (!isGameRunning()) return;
    const data = shard as unknown as ExpShardComp & typeof shard;
    const toPlayer = player.pos.sub(shard.pos);
    const distance = toPlayer.len();
    const pickupRange = playerStats.pickupRadius;

    if (!data.magnetized && distance <= pickupRange) {
      data.magnetized = true;
    }

    if (data.magnetized) {
      data.magnetTime += k.dt();
      const lerpSpeed =
        EXP_MAGNET_BASE_SPEED + data.magnetTime * EXP_MAGNET_SPEED_GROWTH;
      const lerpAmount = clamp(k.dt() * lerpSpeed, 0, 1);
      const targetPos = player.pos;
      const newPos = lerpVec(k, shard.pos, targetPos, lerpAmount);
      const dx = targetPos.x - newPos.x;
      const dy = targetPos.y - newPos.y;
      if (Math.hypot(dx, dy) <= 4) {
        shard.pos = targetPos.clone
          ? targetPos.clone()
          : k.vec2(targetPos.x, targetPos.y);
      } else {
        shard.pos = newPos;
      }
    }

    shard.angle += 120 * k.dt();
  });

  return shard;
};

export const dropExp = (k: any, player: any, total: number, origin: any) => {
  if (total <= 0) return;
  const drops = distributeExp(total);
  const originVec = origin.clone
    ? origin.clone()
    : k.vec2(origin.x ?? 0, origin.y ?? 0);
  drops.forEach((value) => {
    const dropOrigin = originVec.clone
      ? originVec.clone()
      : k.vec2(originVec.x, originVec.y);
    spawnExpShard(k, player, value, dropOrigin);
  });
};
