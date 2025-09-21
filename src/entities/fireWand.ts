import { PALETTE } from "../config/palette";
import type { FireWandData } from "../config/types";
import { levelUpState } from "../systems/playerProgression";
import { isGameRunning } from "../systems/gameState";

export type FireWandLevelDefinition = {
  level: number;
  name: string;
  description: string;
  projectileCount: number;
  damage: number;
  cooldown: number;
  range: number;
  projectileSize: number;
  projectileSpeed: number;
  projectileDuration: number;
};

export const FIRE_WAND_LEVELS: FireWandLevelDefinition[] = [
  {
    level: 1,
    name: "Fire Wand",
    description: "Launch a single fireball at a random enemy.",
    projectileCount: 1,
    damage: 2,
    cooldown: 1.2,
    range: 300,
    projectileSize: 8,
    projectileSpeed: 200,
    projectileDuration: 0.8,
  },
  {
    level: 2,
    name: "Dual Flames",
    description: "Fire two fireballs at once with increased damage.",
    projectileCount: 2,
    damage: 3,
    cooldown: 1.1,
    range: 320,
    projectileSize: 10,
    projectileSpeed: 220,
    projectileDuration: 0.85,
  },
  {
    level: 3,
    name: "Triple Burst",
    description: "Three fireballs with even more power and speed.",
    projectileCount: 3,
    damage: 4,
    cooldown: 1.0,
    range: 340,
    projectileSize: 12,
    projectileSpeed: 240,
    projectileDuration: 0.9,
  },
  {
    level: 4,
    name: "Inferno",
    description: "Four massive fireballs rain down on enemies.",
    projectileCount: 4,
    damage: 5,
    cooldown: 0.9,
    range: 360,
    projectileSize: 14,
    projectileSpeed: 260,
    projectileDuration: 0.95,
  },
];

const findLevelDef = (level: number) =>
  FIRE_WAND_LEVELS.find((def) => def.level === level) ?? null;

export const getNextFireWandLevel = (currentLevel: number) => {
  if (currentLevel <= 0) return FIRE_WAND_LEVELS[0];
  return findLevelDef(currentLevel + 1);
};

export const applyFireWandDefinition = (
  fireWand: any,
  def: FireWandLevelDefinition
) => {
  fireWand.data.level = def.level;
  fireWand.data.active = true;
  fireWand.data.projectileCount = def.projectileCount;
  fireWand.data.damage = def.damage;
  fireWand.data.cooldown = def.cooldown;
  fireWand.data.range = def.range;
  fireWand.data.projectileSize = def.projectileSize;
  fireWand.data.projectileSpeed = def.projectileSpeed;
  fireWand.data.projectileDuration = def.projectileDuration;
  if (typeof fireWand.resetAttackTimer === "function") {
    fireWand.resetAttackTimer();
  }
};

export const FIRE_WAND_DATA: FireWandData = {
  kind: "fireWand",
  level: 0,
  active: false,
  projectileCount: 1,
  damage: 2,
  cooldown: 1.2,
  range: 300,
  projectileSize: 8,
  projectileSpeed: 200,
  projectileDuration: 0.8,
};

export const createFireWand = (k: any, player: any) => {
  const fireWand = k.add([
    k.pos(player.pos),
    {
      data: { ...FIRE_WAND_DATA },
      attackTimer: 0,
      resetAttackTimer() {
        this.attackTimer = 0;
      },
    },
  ]);

  const getRandomEnemy = () => {
    const enemies = k.get("enemy");
    if (enemies.length === 0) return null;
    return enemies[Math.floor(Math.random() * enemies.length)];
  };

  const spawnFireball = (target: any) => {
    if (!target) return;

    const direction = target.pos.sub(player.pos).unit();
    const initialPos = player.pos.add(direction.scale(20));

    const fireball = k.add([
      k.pos(initialPos),
      k.rect(fireWand.data.projectileSize, fireWand.data.projectileSize),
      k.anchor("center"),
      k.color(...PALETTE.ember),
      k.opacity(0.9),
      k.area(),
      "fireWandProjectile",
      {
        damage: fireWand.data.damage,
        life: fireWand.data.projectileDuration,
        maxLife: fireWand.data.projectileDuration,
        velocity: direction.scale(fireWand.data.projectileSpeed),
        hitTargets: new Set<any>(),
      },
    ]);

    fireball.onUpdate(() => {
      if (!isGameRunning()) return;
      fireball.life -= k.dt();
      if (fireball.life <= 0) {
        k.destroy(fireball);
        return;
      }

      fireball.pos = fireball.pos.add(fireball.velocity.scale(k.dt()));
      fireball.opacity = Math.max(0, fireball.life / fireball.maxLife);
    });
  };

  const beginAttack = () => {
    const enemies = k.get("enemy");
    if (enemies.length === 0) return;

    // Fire multiple projectiles at random enemies
    for (let i = 0; i < fireWand.data.projectileCount; i++) {
      const target = getRandomEnemy();
      if (target) {
        // Add slight delay between projectiles
        const delay = i * 0.1;
        if (delay <= 0) {
          spawnFireball(target);
        } else {
          k.wait(delay, () => spawnFireball(target));
        }
      }
    }
  };

  fireWand.onUpdate(() => {
    fireWand.pos = player.pos;
    if (!fireWand.data.active) return;
    if (!isGameRunning()) return;
    if (levelUpState.active) return;

    fireWand.attackTimer -= k.dt();
    if (fireWand.attackTimer > 0) return;

    beginAttack();
    fireWand.attackTimer = fireWand.data.cooldown;
  });

  return fireWand;
};