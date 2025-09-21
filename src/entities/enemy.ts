import { ENEMY_EXP, ENEMY_SPEED, ENEMY_TOUCH_DAMAGE } from "../config/constants";
import type { EnemyData, EnemyOverrides } from "../config/types";
import { registerEnemy } from "../systems/enemyManager";
import { dropExp } from "../systems/experience";
import { attachHealthLabel } from "../ui/healthLabel";
import { unitVec } from "../utils/vector";

const ENEMY_BASE: Omit<EnemyData, "maxHP"> & { maxHP: number } = {
  kind: "enemy",
  speed: ENEMY_SPEED,
  touchDamage: ENEMY_TOUCH_DAMAGE,
  exp: ENEMY_EXP,
  maxHP: 4,
};

export const createEnemy = (
  k: any,
  player: any,
  position: any,
  overrides: EnemyOverrides = {}
) => {
  const enemyData: EnemyData = {
    kind: "enemy",
    speed: overrides.speed ?? ENEMY_BASE.speed,
    touchDamage: overrides.touchDamage ?? ENEMY_BASE.touchDamage,
    maxHP: overrides.hp ?? ENEMY_BASE.maxHP,
    exp: overrides.exp ?? ENEMY_BASE.exp,
  };

  const enemy = k.add([
    k.pos(position),
    k.rect(28, 28),
    k.color(50, 180, 255),
    k.anchor("center"),
    k.area(),
    k.body(),
    k.health(enemyData.maxHP),
    "enemy",
    {
      touchTimer: 0,
      _kbTween: null as any,
      data: enemyData,
    },
  ]);

  attachHealthLabel(k, enemy, -24);
  registerEnemy(enemy);

  enemy.on("death", () => {
    const amount = Math.max(0, Math.round(enemy.data.exp ?? ENEMY_BASE.exp));
    if (amount > 0) {
      const origin = enemy.pos.clone ? enemy.pos.clone() : k.vec2(enemy.pos.x, enemy.pos.y);
      dropExp(k, player, amount, origin);
    }
  });

  enemy.onUpdate(() => {
    const dir = unitVec(k, player.pos.sub(enemy.pos));
    enemy.move(dir.x * enemy.data.speed, dir.y * enemy.data.speed);
    if (enemy.touchTimer > 0) enemy.touchTimer -= k.dt();
  });

  return enemy;
};
