export type PlayerData = {
  kind: "player";
  speed: number;
  maxHP: number;
  facing: { x: number; y: number };
};

export type EnemyData = {
  kind: "enemy";
  speed: number;
  touchDamage: number;
  maxHP: number;
  exp: number;
};

export type EnemyOverrides = {
  hp?: number;
  speed?: number;
  touchDamage?: number;
  exp?: number;
};

export type DaggerData = {
  kind: "dagger";
  damage: number;
  rotSpeed: number;
  distance: number;
  level: number;
  count: number;
};

export type FastSwordData = {
   kind: "fastSword";
   level: number;
   active: boolean;
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

export type RangedEnemyData = {
    kind: "rangedEnemy";
    speed: number;
    touchDamage: number;
    maxHP: number;
    exp: number;
    attackDistance: number;
    bulletSpeed: number;
    bulletDamage: number;
  };

export type BitEnemyData = {
    kind: "bitEnemy";
    speed: number;
    touchDamage: number;
    maxHP: number;
    exp: number;
    chargingSpeed: number;
    chargeDuration: number;
    chargeCooldown: number;
    knockbackResistance: number;
  };

export type RGB = [number, number, number];

export type EdgeName = "top" | "bottom" | "left" | "right";

export type SpawnLocationConfig =
  | { kind: "random"; padding?: number }
  | { kind: "edge"; edge?: EdgeName | "random"; padding?: number }
  | { kind: "points"; points: [number, number][]; jitter?: number };

export type EnemyGroupConfig = {
    count: number;
    hp?: number;
    speed?: number;
    touchDamage?: number;
    exp?: number;
    spawn: SpawnLocationConfig;
    enemyType?: "basic" | "ranged" | "bit";
  };

export type WaveConfig = {
  name?: string;
  delay: number;
  enemies: EnemyGroupConfig[];
  repeat?: number;
};

export type WavePhase = "waiting" | "spawning" | "clearing" | "done" | "stopped";

export type UpgradeOption = {
  id: string;
  name: string;
  description: string;
  apply: () => void;
};

export type ExpTierDef = {
  value: number;
  color: RGB;
  radius: number;
};

export type ExpShardComp = {
  expValue: number;
  magnetized: boolean;
  magnetTime: number;
};
