import {
  RANGED_ENEMY_SPEED,
  RANGED_ENEMY_ATTACK_DISTANCE,
  RANGED_ENEMY_BULLET_SPEED,
  RANGED_ENEMY_BULLET_DAMAGE,
  ENEMY_EXP,
  ENEMY_TOUCH_DAMAGE
} from "../config/constants";
import type { RangedEnemyData } from "../config/types";
import { PALETTE } from "../config/palette";
import { registerEnemy } from "../systems/enemyManager";
import { dropExp } from "../systems/experience";
import { levelUpState } from "../systems/playerProgression";
import { isGameRunning } from "../systems/gameState";
import { attachHealthLabel } from "../ui/healthLabel";
import { lighten } from "../utils/color";

const RANGED_ENEMY_BASE: Omit<RangedEnemyData, "maxHP"> & { maxHP: number } = {
  kind: "rangedEnemy",
  speed: RANGED_ENEMY_SPEED,
  touchDamage: ENEMY_TOUCH_DAMAGE,
  exp: ENEMY_EXP,
  maxHP: 6,
  attackDistance: RANGED_ENEMY_ATTACK_DISTANCE,
  bulletSpeed: RANGED_ENEMY_BULLET_SPEED,
  bulletDamage: RANGED_ENEMY_BULLET_DAMAGE,
};

export const createRangedEnemy = (
  k: any,
  player: any,
  position: any,
  overrides: Partial<RangedEnemyData> = {}
) => {
  const enemyData: RangedEnemyData = {
    kind: "rangedEnemy",
    speed: overrides.speed ?? RANGED_ENEMY_BASE.speed,
    touchDamage: overrides.touchDamage ?? RANGED_ENEMY_BASE.touchDamage,
    maxHP: overrides.maxHP ?? RANGED_ENEMY_BASE.maxHP,
    exp: overrides.exp ?? RANGED_ENEMY_BASE.exp,
    attackDistance: overrides.attackDistance ?? RANGED_ENEMY_BASE.attackDistance,
    bulletSpeed: overrides.bulletSpeed ?? RANGED_ENEMY_BASE.bulletSpeed,
    bulletDamage: overrides.bulletDamage ?? RANGED_ENEMY_BASE.bulletDamage,
  };

  const enemy = k.add([
    k.pos(position),
    k.rect(32, 32),
    k.color(...PALETTE.accent),
    k.outline(2, k.rgb(...lighten(PALETTE.accent, 0.2))),
    k.anchor("center"),
    k.area(),
    k.health(enemyData.maxHP),
    "enemy",
    "rangedEnemy",
    {
      touchTimer: 0,
      _kbTween: null as any,
      data: enemyData,
    },
  ]);

  attachHealthLabel(k, enemy, -24);
  registerEnemy(enemy);

  console.log("Ranged enemy created at position:", enemy.pos);
  console.log("Ranged enemy health:", enemy.hp());

  // Simple shooting behavior for debugging
  let attackTimer = 0;
  const ATTACK_COOLDOWN = 2.0; // Shoot every 2 seconds

  enemy.onUpdate(() => {
    if (!isGameRunning()) return;
    if (levelUpState.active) return;

    // Move toward player
    if (player.exists()) {
      const dir = player.pos.sub(enemy.pos).unit();
      enemy.move(dir.scale(enemyData.speed));
    }

    // Attack timer
    attackTimer -= k.dt();
    if (attackTimer <= 0 && player.exists()) {
      const dir = player.pos.sub(enemy.pos).unit();

      // Create bullet
      const bullet = k.add([
        k.pos(enemy.pos),
        k.move(dir, enemyData.bulletSpeed),
        k.rect(8, 8),
        k.area(),
        k.offscreen({ destroy: true }),
        k.anchor("center"),
        k.color(...PALETTE.ember),
        k.opacity(1.0),
        "rangedBullet",
        {
          damage: enemyData.bulletDamage,
        },
      ]);

      // Add collision with player
      bullet.onCollide("player", (player: any) => {
        k.destroy(bullet);
        // Player takes damage from bullet
        if (player.hurt) {
          player.hurt(enemyData.bulletDamage);
        }
      });

      attackTimer = ATTACK_COOLDOWN;
    }

    if (enemy.touchTimer > 0) enemy.touchTimer -= k.dt();
  });

  enemy.on("death", () => {
    const amount = Math.max(0, Math.round(enemy.data.exp ?? RANGED_ENEMY_BASE.exp));
    if (amount > 0) {
      const origin = enemy.pos.clone ? enemy.pos.clone() : k.vec2(enemy.pos.x, enemy.pos.y);
      dropExp(k, player, amount, origin);
    }
  });

  enemy.onUpdate(() => {
    if (!isGameRunning()) return;
    if (levelUpState.active) return;
    if (enemy.touchTimer > 0) enemy.touchTimer -= k.dt();
  });

  return enemy;
};