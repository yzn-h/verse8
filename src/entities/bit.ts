import {
  BIT_ENEMY_SPEED,
  BIT_ENEMY_CHARGING_SPEED,
  BIT_ENEMY_TOUCH_DAMAGE,
  BIT_ENEMY_EXP,
  BIT_ENEMY_CHARGE_DURATION,
  BIT_ENEMY_CHARGE_COOLDOWN,
  BIT_ENEMY_KNOCKBACK_RESISTANCE,
} from "../config/constants";
import type { BitEnemyData } from "../config/types";
import { PALETTE } from "../config/palette";
import { registerEnemy } from "../systems/enemyManager";
import { dropExp } from "../systems/experience";
import { levelUpState } from "../systems/playerProgression";
import { isGameRunning } from "../systems/gameState";
import { attachHealthLabel } from "../ui/healthLabel";
import { lighten } from "../utils/color";
import { unitVec } from "../utils/vector";

const BIT_ENEMY_BASE: Omit<BitEnemyData, "maxHP"> & { maxHP: number } = {
  kind: "bitEnemy",
  speed: BIT_ENEMY_SPEED,
  touchDamage: BIT_ENEMY_TOUCH_DAMAGE,
  exp: BIT_ENEMY_EXP,
  maxHP: 8,
  chargingSpeed: BIT_ENEMY_CHARGING_SPEED,
  chargeDuration: BIT_ENEMY_CHARGE_DURATION,
  chargeCooldown: BIT_ENEMY_CHARGE_COOLDOWN,
  knockbackResistance: BIT_ENEMY_KNOCKBACK_RESISTANCE,
};

export const createBitEnemy = (
  k: any,
  player: any,
  position: any,
  overrides: Partial<BitEnemyData> = {}
) => {
  const enemyData: BitEnemyData = {
    kind: "bitEnemy",
    speed: overrides.speed ?? BIT_ENEMY_BASE.speed,
    touchDamage: overrides.touchDamage ?? BIT_ENEMY_BASE.touchDamage,
    maxHP: overrides.maxHP ?? BIT_ENEMY_BASE.maxHP,
    exp: overrides.exp ?? BIT_ENEMY_BASE.exp,
    chargingSpeed: overrides.chargingSpeed ?? BIT_ENEMY_BASE.chargingSpeed,
    chargeDuration: overrides.chargeDuration ?? BIT_ENEMY_BASE.chargeDuration,
    chargeCooldown: overrides.chargeCooldown ?? BIT_ENEMY_BASE.chargeCooldown,
    knockbackResistance: overrides.knockbackResistance ?? BIT_ENEMY_BASE.knockbackResistance,
  };

  const enemy = k.add([
    k.pos(position),
    k.rect(32, 32),
    k.color(...PALETTE.accent),
    k.outline(2, k.rgb(...lighten(PALETTE.accent, 0.2))),
    k.anchor("center"),
    k.area(),
    k.body(),
    k.health(enemyData.maxHP),
    "enemy",
    "bitEnemy",
    {
      touchTimer: 0,
      _kbTween: null as any,
      data: enemyData,
      isCharging: false,
      chargeTimer: 0,
      chargeCooldownTimer: 0,
    },
  ]);

  attachHealthLabel(k, enemy, -24);
  registerEnemy(enemy);

  enemy.on("death", () => {
    console.log("Bit enemy died, dropping XP");
    const amount = Math.max(0, Math.round(enemy.data.exp ?? BIT_ENEMY_BASE.exp));
    if (amount > 0) {
      const origin = enemy.pos.clone ? enemy.pos.clone() : k.vec2(enemy.pos.x, enemy.pos.y);
      dropExp(k, player, amount, origin);
    }
  });

  enemy.onUpdate(() => {
    if (!isGameRunning()) return;
    if (levelUpState.active) return;

    // Update charging state
    if (enemy.isCharging) {
      enemy.chargeTimer -= k.dt();
      if (enemy.chargeTimer <= 0) {
        enemy.isCharging = false;
        enemy.chargeCooldownTimer = enemyData.chargeCooldown;
      }
    } else if (enemy.chargeCooldownTimer > 0) {
      enemy.chargeCooldownTimer -= k.dt();
    }

    // Start charging when cooldown is over and player is in range
    if (!enemy.isCharging && enemy.chargeCooldownTimer <= 0 && player && player.pos) {
      const distance = player.pos.sub(enemy.pos).len();
      if (distance < 300) { // Start charging when player is within 300 units
        enemy.isCharging = true;
        enemy.chargeTimer = enemyData.chargeDuration;
      }
    }

    // Update visual appearance based on charging state
    if (enemy.isCharging) {
      // Make it visually clear when charging - brighter color and slight glow effect
      enemy.color = k.rgb(...PALETTE.ember);
      enemy.outline = k.outline(3, k.rgb(...lighten(PALETTE.ember, 0.4)));
    } else {
      // Normal appearance
      enemy.color = k.rgb(...PALETTE.accent);
      enemy.outline = k.outline(2, k.rgb(...lighten(PALETTE.accent, 0.2)));
    }

    // Movement logic
    if (enemy.isCharging && player && player.pos) {
      // Charge directly at player at high speed
      const dir = unitVec(k, player.pos.sub(enemy.pos));
      enemy.move(dir.x * enemyData.chargingSpeed, dir.y * enemyData.chargingSpeed);
    } else if (player && player.pos) {
      // Normal movement toward player
      const dir = unitVec(k, player.pos.sub(enemy.pos));
      enemy.move(dir.x * enemyData.speed, dir.y * enemyData.speed);
    }

    if (enemy.touchTimer > 0) enemy.touchTimer -= k.dt();
  });

  return enemy;
};