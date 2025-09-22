import kaplay from "kaplay";

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

export type FireWandData = {
  kind: "fireWand";
  level: number;
  active: boolean;
  projectileCount: number;
  damage: number;
  cooldown: number;
  range: number;
  projectileSize: number;
  projectileSpeed: number;
  projectileDuration: number;
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

export const PLAYER_SPEED = 320;
export const PLAYER_MAX_HP = 5;

export const DAGGER_ROT_SPEED = 260;
export const DAGGER_DAMAGE = 1;
export const DAGGER_DISTANCE = 40;
export const DAGGER_KNOCKBACK_DIST = 52;

export const ENEMY_SPEED = 90;
export const ENEMY_TOUCH_DAMAGE = 1;
export const ENEMY_EXP = 1;

export const RANGED_ENEMY_SPEED = 60;
export const RANGED_ENEMY_ATTACK_DISTANCE = 200;
export const RANGED_ENEMY_BULLET_SPEED = 400;
export const RANGED_ENEMY_BULLET_DAMAGE = 2;
export const RANGED_ENEMY_IDLE_TIME = 0.5;
export const RANGED_ENEMY_ATTACK_TIME = 1.0;
export const RANGED_ENEMY_MOVE_TIME = 2.0;

export const BIT_ENEMY_SPEED = 70;
export const BIT_ENEMY_CHARGING_SPEED = 200;
export const BIT_ENEMY_TOUCH_DAMAGE = 2;
export const BIT_ENEMY_EXP = 3;
export const BIT_ENEMY_CHARGE_DURATION = 1.5;
export const BIT_ENEMY_CHARGE_COOLDOWN = 3.0;
export const BIT_ENEMY_KNOCKBACK_RESISTANCE = 0.2;

export const KNOCKBACK_DIST = 36;
export const KNOCKBACK_TIME = 0.12;
export const TOUCH_COOLDOWN = 0.4;

export const DEFAULT_PICKUP_RADIUS = 120;

export const LEVEL_XP_BASE = 8;
export const LEVEL_XP_GROWTH = 5;

export const XP_BAR_WIDTH = 300;
export const XP_BAR_HEIGHT = 12;
export const XP_BAR_MARGIN = 16;
export const XP_BAR_BOTTOM_OFFSET = 28;

export const EXP_MAGNET_BASE_SPEED = 6;
export const EXP_MAGNET_SPEED_GROWTH = 4;

export const FIRE_WAND_DAMAGE = 2;
export const FIRE_WAND_COOLDOWN = 1.2;
export const FIRE_WAND_RANGE = 300;
export const FIRE_WAND_PROJECTILE_SIZE = 8;
export const FIRE_WAND_PROJECTILE_SPEED = 200;
export const FIRE_WAND_PROJECTILE_DURATION = 0.8;

export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 600;

export const PALETTE = {
  text: [249, 245, 240] as RGB,
  background: [11, 8, 4] as RGB,
  primary: [198, 130, 57] as RGB,
  secondary: [101, 65, 26] as RGB,
  accent: [157, 96, 32] as RGB,
  dune: [217, 176, 124] as RGB,
  ember: [229, 148, 63] as RGB,
} as const;

export type PaletteKey = keyof typeof PALETTE;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const randRange = (min: number, max: number) => min + Math.random() * (max - min);

export const distribute = (idx: number, count: number) =>
  (count <= 1 ? 0.5 : idx / (count - 1));

export const unitVec = (k: any, v: any) =>
  v?.len && v.len() > 0 ? v.unit() : k.vec2(0, 0);

export const lerpVec = (k: any, from: any, to: any, t: number) =>
  k.vec2(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);

export const jitterVec = (k: any, v: any, jitter = 0) => {
  if (!jitter) return k.vec2(v.x, v.y);
  return k.vec2(
    v.x + randRange(-jitter, jitter),
    v.y + randRange(-jitter, jitter)
  );
};

export const lighten = (color: RGB, amount: number): RGB => {
  const a = clamp(amount, 0, 1);
  return [
    clamp(Math.round(color[0] + (255 - color[0]) * a), 0, 255),
    clamp(Math.round(color[1] + (255 - color[1]) * a), 0, 255),
    clamp(Math.round(color[2] + (255 - color[2]) * a), 0, 255),
  ];
};

export const knockback = (
  k: any,
  obj: any,
  fromPos: any,
  dist = KNOCKBACK_DIST
) => {
  const dir = unitVec(k, obj.pos.sub(fromPos));
  const to = obj.pos.add(dir.scale(dist));
  if (obj._kbTween && obj._kbTween.cancel) obj._kbTween.cancel();
  obj._kbTween = k.tween(
    obj.pos,
    to,
    KNOCKBACK_TIME,
    (p: any) => (obj.pos = p),
    k.easings.easeOutCubic
  );
};

export type GamePhase = "start" | "running" | "paused" | "gameover";

type GamePhaseListener = (phase: GamePhase, previous: GamePhase) => void;

type PhaseSubscription = { cancel: () => void };

const listeners = new Set<GamePhaseListener>();

export const gameState: { phase: GamePhase } = {
  phase: "start",
};

const notify = (next: GamePhase, prev: GamePhase) => {
  listeners.forEach((listener) => {
    listener(next, prev);
  });
};

export const setGamePhase = (phase: GamePhase) => {
  if (gameState.phase === phase) return;
  const previous = gameState.phase;
  gameState.phase = phase;
  notify(phase, previous);
};

export const onGamePhaseChange = (listener: GamePhaseListener): PhaseSubscription => {
  listeners.add(listener);
  return {
    cancel: () => listeners.delete(listener),
  };
};

export const getGamePhase = () => gameState.phase;

export const isGameRunning = () => gameState.phase === "running";

export const isGamePaused = () => gameState.phase === "paused";

export const isAtStartScreen = () => gameState.phase === "start";

export const startGameplay = () => {
  if (gameState.phase === "running") return;
  setGamePhase("running");
};

export const pauseGameplay = () => {
  if (gameState.phase !== "running") return;
  setGamePhase("paused");
};

export const resumeGameplay = () => {
  if (gameState.phase !== "paused") return;
  setGamePhase("running");
};

export const togglePause = () => {
  if (gameState.phase === "paused") {
    resumeGameplay();
  } else if (gameState.phase === "running") {
    pauseGameplay();
  }
  return gameState.phase;
};

export const markGameOver = () => {
  if (gameState.phase === "gameover") return;
  setGamePhase("gameover");
};

export const resetToStart = () => {
  setGamePhase("start");
};

const enemiesAlive = new Set<any>();
let activeEnemyCount = 0;

export const registerEnemy = (enemy: any) => {
  activeEnemyCount += 1;
  enemiesAlive.add(enemy);

  const cleanup = () => {
    if (enemiesAlive.delete(enemy)) {
      activeEnemyCount = Math.max(0, activeEnemyCount - 1);
    }
  };

  enemy.on("death", cleanup);
  enemy.on("destroy", cleanup);
};

export const getActiveEnemyCount = () => activeEnemyCount;


export const playerStats = {
  level: 1,
  exp: 0,
  totalExp: 0,
  expToNext: 0,
  pickupRadius: DEFAULT_PICKUP_RADIUS,
};

export const levelUpState = {
  pending: 0,
  active: false,
};

let levelUpQueueListener: (() => void) | null = null;

export const onLevelUpQueued = (listener: () => void) => {
  levelUpQueueListener = listener;
};

export const expRequiredForLevel = (level: number) =>
  Math.max(1, Math.round(LEVEL_XP_BASE + (level - 1) * LEVEL_XP_GROWTH));

export const initPlayerProgression = () => {
  playerStats.exp = 0;
  playerStats.totalExp = 0;
  playerStats.level = 1;
  playerStats.expToNext = expRequiredForLevel(playerStats.level);
  playerStats.pickupRadius = DEFAULT_PICKUP_RADIUS;
  levelUpState.pending = 0;
  levelUpState.active = false;
};

export const grantExp = (amount: number) => {
  if (amount <= 0) return;
  playerStats.totalExp += amount;
  playerStats.exp += amount;

  while (playerStats.expToNext > 0 && playerStats.exp >= playerStats.expToNext) {
    playerStats.exp -= playerStats.expToNext;
    playerStats.level += 1;
    playerStats.expToNext = expRequiredForLevel(playerStats.level);
    queueLevelUp();
  }
};

export const queueLevelUp = () => {
  levelUpState.pending += 1;
  levelUpQueueListener?.();
};

export const setLevelUpActive = (value: boolean) => {
  levelUpState.active = value;
};

export const consumePendingLevelUp = () => {
  if (levelUpState.pending <= 0) {
    return false;
  }
  levelUpState.pending -= 1;
  return true;
};


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
  console.log(`Dropping ${total} XP at position:`, origin);
  const drops = distributeExp(total);
  const originVec = origin.clone
    ? origin.clone()
    : k.vec2(origin.x ?? 0, origin.y ?? 0);
  drops.forEach((value) => {
    const dropOrigin = originVec.clone
      ? originVec.clone()
      : k.vec2(originVec.x, originVec.y);
    console.log(`Spawning XP shard with value ${value}`);
    spawnExpShard(k, player, value, dropOrigin);
  });
};

type AudioHooks = {
  whenReady: Promise<void>;
  startAmbient: () => void;
  pauseAmbient: () => void;
  resumeAmbient: () => void;
  fadeAmbientTo: (volume: number, duration?: number) => void;
  stopAmbient: () => void;
  playWaveSpawn: () => void;
  playUiConfirm: () => void;
  playEnemyHit: () => void;
  playPlayerHit: () => void;
  playUpgradeOpen: () => void;
  playUpgradeConfirm: () => void;
  playXpPickup: () => void;
};

const ease = (t: number) => t * t * (3 - 2 * t);

export const createAudioManager = (k: any): AudioHooks => {
  const assets: Array<{ id: string; path: string }> = [
    { id: "ambientHum", path: "/audio/ambient-hum.wav" },
    { id: "ambientShimmer", path: "/audio/ambient-shimmer.wav" },
    { id: "ambientGrit", path: "/audio/ambient-grit.wav" },
    { id: "waveWhoosh", path: "/audio/wave-whoosh.wav" },
    { id: "uiSoftBlip", path: "/audio/ui-soft-blip.wav" },
    { id: "enemyHit", path: "/audio/enemy-hit.wav" },
    { id: "enemyHitBright", path: "/audio/enemy-hit-bright.wav" },
    { id: "enemyHitMid", path: "/audio/enemy-hit-mid.wav" },
    { id: "enemyHitSoft", path: "/audio/enemy-hit-soft.wav" },
    { id: "playerHit", path: "/audio/player-hit.wav" },
    { id: "upgradeSoft", path: "/audio/upgrade-soft.wav" },
    { id: "xpPickup", path: "/audio/xp-pickup.wav" },
  ];

  const loadPromises = assets.map(({ id, path }) =>
    k
      .loadSound(id, path)
      .catch((err: unknown) => console.warn(`[audio] failed to load ${id}`, err))
  );

  const whenReady = Promise.allSettled(loadPromises).then(() => undefined);

  const ambientLayers = [
    { id: "ambientHum", baseVolume: 0.36, startOffset: 1.5 },
    { id: "ambientShimmer", baseVolume: 0.24, startOffset: 3.0 },
    { id: "ambientGrit", baseVolume: 0.28, startOffset: 2.2 },
  ];

  const ambientHandles = new Map<string, ReturnType<typeof k.play>>();
  let ambientIntensity = 0.2;
  let fadeTicker: ReturnType<typeof k.onUpdate> | null = null;

  // Enemy hit combo system
  const enemyHitSounds = ["enemyHit", "enemyHitBright", "enemyHitMid", "enemyHitSoft"];
  let enemyHitComboIndex = 0;
  let lastEnemyHitTime = 0;
  const COMBO_WINDOW = 0.3; // 300ms window for combo hits

  const ensureAmbientLayers = () => {
    ambientLayers.forEach((layer) => {
      const existing = ambientHandles.get(layer.id);
      if (existing && !(existing as any).stopped) {
        existing.paused = false;
        existing.loop = true;
        return;
      }
      const handle = k.play(layer.id, {
        loop: true,
        volume: layer.baseVolume * ambientIntensity,
        seek: Math.random() * layer.startOffset,
      });
      ambientHandles.set(layer.id, handle);
    });
  };

  const updateAmbientVolumes = () => {
    ambientLayers.forEach((layer) => {
      const handle = ambientHandles.get(layer.id);
      if (!handle) return;
      handle.volume = layer.baseVolume * ambientIntensity;
    });
  };

  const fadeAmbientTo = (targetVolume: number, duration = 0.6) => {
    const clampedTarget = clamp(targetVolume, 0, 1);
    ensureAmbientLayers();
    const startIntensity = ambientIntensity;
    if (duration <= 0) {
      ambientIntensity = clampedTarget;
      updateAmbientVolumes();
      return;
    }
    fadeTicker?.cancel?.();
    const startTime = k.time();
    fadeTicker = k.onUpdate(() => {
      const elapsed = k.time() - startTime;
      const t = Math.min(1, elapsed / duration);
      ambientIntensity =
        startIntensity + (clampedTarget - startIntensity) * ease(t);
      updateAmbientVolumes();
      if (t >= 1) {
        fadeTicker?.cancel?.();
        fadeTicker = null;
      }
    });
  };

  const playWaveSpawn = () => {
    const baseVolume = 0.26 + Math.random() * 0.08;
    const speed = 0.92 + Math.random() * 0.12;
    k.play("waveWhoosh", {
      volume: baseVolume,
      speed,
      detune: (Math.random() - 0.5) * 90,
    });
  };

  const playUiConfirm = () => {
    k.play("uiSoftBlip", {
      volume: 0.22,
      speed: 1.05 + Math.random() * 0.05,
    });
  };

  const pauseAmbient = () => {
    ambientHandles.forEach((handle) => {
      handle.paused = true;
    });
  };

  const resumeAmbient = () => {
    ensureAmbientLayers();
    ambientHandles.forEach((handle) => {
      handle.paused = false;
      handle.loop = true;
    });
    updateAmbientVolumes();
  };

  const startAmbient = () => {
    ensureAmbientLayers();
    updateAmbientVolumes();
  };

  const stopAmbient = () => {
    fadeTicker?.cancel?.();
    fadeTicker = null;
    ambientHandles.forEach((handle) => handle.stop());
    ambientHandles.clear();
  };

  const getNextEnemyHitSound = () => {
    const currentTime = k.time();
    const timeSinceLastHit = currentTime - lastEnemyHitTime;

    // If it's been too long since last hit, reset combo
    if (timeSinceLastHit > COMBO_WINDOW) {
      enemyHitComboIndex = 0;
    }

    const soundId = enemyHitSounds[enemyHitComboIndex];
    enemyHitComboIndex = (enemyHitComboIndex + 1) % enemyHitSounds.length;
    lastEnemyHitTime = currentTime;

    return soundId;
  };

  const playEnemyHit = () => {
    const soundId = getNextEnemyHitSound();
    k.play(soundId, {
      volume: 0.22 + Math.random() * 0.06,
      speed: 0.95 + Math.random() * 0.1,
    });
  };

  const playPlayerHit = () => {
    k.play("playerHit", {
      volume: 0.26 + Math.random() * 0.08,
      speed: 0.9 + Math.random() * 0.08,
    });
  };

  const playUpgradeOpen = () => {
    k.play("upgradeSoft", {
      volume: 0.18,
      speed: 0.95 + Math.random() * 0.1,
    });
  };

  const playUpgradeConfirm = () => {
    k.play("upgradeSoft", {
      volume: 0.26,
      speed: 1 + Math.random() * 0.05,
      detune: 20 + Math.random() * 15,
    });
  };

  const playXpPickup = () => {
    k.play("xpPickup", {
      volume: 0.2,
      speed: 1 + Math.random() * 0.04,
    });
  };

  return {
    whenReady,
    startAmbient,
    pauseAmbient,
    resumeAmbient,
    fadeAmbientTo,
    stopAmbient,
    playWaveSpawn,
    playUiConfirm,
    playEnemyHit,
    playPlayerHit,
    playUpgradeOpen,
    playUpgradeConfirm,
    playXpPickup,
  };
};

export type AudioManager = ReturnType<typeof createAudioManager>;

const readHP = (o: any) => (typeof o.hp === "function" ? o.hp() : o.hp);
const readMax = (o: any) => {
  if (o?.data?.maxHP != null) return o.data.maxHP;
  const value = typeof o.maxHP === "function" ? o.maxHP() : o.maxHP;
  return value ?? 0;
};

export const attachHealthLabel = (k: any, target: any, yOffset = -28) => {
  const label = k.add([
    k.text("", { size: 12 }),
    k.pos(target.pos.x, target.pos.y + yOffset),
    k.color(...PALETTE.text),
    k.anchor("center"),
    "healthLabel",
    "ui",
    { yOffset },
  ]);

  const refresh = () => {
    label.text = `${readHP(target)}/${readMax(target)}`;
  };

  target.onUpdate(() => {
    label.pos = target.pos.add(0, label.yOffset);
  });
  target.on("hurt", refresh);
  target.on("heal", refresh);
  target.on("death", () => k.destroy(label));
  target.on("destroy", () => k.destroy(label));
  refresh();
};

const healthBarRefs: { background: any; fill: any } = {
  background: null,
  fill: null,
};

export const createHealthBar = (k: any, target: any) => {
  const barWidth = 100;
  const barHeight = 16;
  const yOffset = -60;

  // Background bar (empty health)
  healthBarRefs.background = k.add([
    k.rect(barWidth + 4, barHeight + 4),
    k.pos(target.pos.x - barWidth/2 - 2, target.pos.y + yOffset - 2),
    k.color(...PALETTE.secondary),
    k.outline(2, k.rgb(...lighten(PALETTE.secondary, 0.35))),
    k.anchor("center"),
    "healthBar",
    "ui",
  ]);

  // Fill bar (current health)
  healthBarRefs.fill = k.add([
    k.rect(barWidth, barHeight),
    k.pos(target.pos.x - barWidth/2, target.pos.y + yOffset),
    k.color(...PALETTE.primary),
    k.anchor("center"),
    "healthBar",
    "ui",
    { baseWidth: barWidth },
  ]);

  const updateHealthBar = () => {
    const fill = healthBarRefs.fill;
    if (fill) {
      const currentHP = typeof target.hp === "function" ? target.hp() : target.hp;
      const maxHP = PLAYER_MAX_HP;
      const ratio = maxHP > 0 ? currentHP / maxHP : 0;
      const clamped = Math.min(1, Math.max(0, ratio));
      const baseWidth = fill.baseWidth ?? fill.width ?? 0;

      if (typeof fill.width === "number") {
        fill.width = baseWidth * clamped;
      } else if (fill.scale) {
        fill.scale.x = clamped;
      }
    }
  };

  const updatePosition = () => {
    const background = healthBarRefs.background;
    const fill = healthBarRefs.fill;
    if (background && fill) {
      background.pos = target.pos.add(0, yOffset);
      fill.pos = target.pos.add(0, yOffset);
      debugLabel.pos = target.pos.add(0, yOffset - 25);
    }
  };

  // Debug: Add a simple text label to see if the health bar is being created
  const debugLabel = k.add([
    k.text("HP", { size: 10 }),
    k.pos(target.pos.x, target.pos.y + yOffset - 25),
    k.color(...PALETTE.text),
    k.anchor("center"),
    "healthBar",
    "ui",
  ]);

  target.onUpdate(updatePosition);
  target.on("hurt", updateHealthBar);
  target.on("heal", updateHealthBar);
  target.on("death", () => {
    k.destroy(healthBarRefs.background);
    k.destroy(healthBarRefs.fill);
    k.destroy(debugLabel);
  });
  target.on("destroy", () => {
    k.destroy(healthBarRefs.background);
    k.destroy(healthBarRefs.fill);
    k.destroy(debugLabel);
  });

  updateHealthBar();
  updatePosition();

  return { updateHealthBar };
};


const xpUiRefs: { fill: any; label: any } = {
  fill: null,
  label: null,
};

export const createXpBar = (k: any) => {
  k.add([
    k.rect(XP_BAR_WIDTH + 4, XP_BAR_HEIGHT + 4),
    k.pos(
      XP_BAR_MARGIN - 2,
      k.height() - XP_BAR_BOTTOM_OFFSET - XP_BAR_HEIGHT - 2
    ),
    k.color(...PALETTE.secondary),
    k.outline(2, k.rgb(...lighten(PALETTE.secondary, 0.35))),
    k.anchor("topleft"),
    k.fixed(),
    "ui",
  ]);

  xpUiRefs.fill = k.add([
    k.rect(XP_BAR_WIDTH, XP_BAR_HEIGHT),
    k.pos(XP_BAR_MARGIN, k.height() - XP_BAR_BOTTOM_OFFSET - XP_BAR_HEIGHT),
    k.color(...PALETTE.primary),
    k.anchor("topleft"),
    k.fixed(),
    "ui",
    { baseWidth: XP_BAR_WIDTH },
  ]);

  xpUiRefs.label = k.add([
    k.text("", { size: 16, align: "left" }),
    k.pos(
      XP_BAR_MARGIN,
      k.height() - XP_BAR_BOTTOM_OFFSET - XP_BAR_HEIGHT - 18
    ),
    k.color(...PALETTE.text),
    k.anchor("topleft"),
    k.fixed(),
    "ui",
  ]);

  const updateXpBarUI = () => {
    const fill = xpUiRefs.fill;
    if (fill) {
      const ratio = playerStats.expToNext > 0 ? playerStats.exp / playerStats.expToNext : 0;
      const clamped = Math.min(1, Math.max(0, ratio));
      const baseWidth = fill.baseWidth ?? fill.width ?? 0;
      if (typeof fill.width === "number") {
        fill.width = baseWidth * clamped;
      } else if (fill.scale) {
        fill.scale.x = clamped;
      }
    }

    const label = xpUiRefs.label;
    if (label) {
      label.text = `Level ${playerStats.level} - ${Math.round(playerStats.exp)}/${playerStats.expToNext}`;
    }
  };

  updateXpBarUI();
  return { updateXpBarUI };
};


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
    name: "Twin Daggers",
    description: "Two blades orbit quickly around the hunter.",
    count: 2,
    damage: DAGGER_DAMAGE,
    rotSpeed: DAGGER_ROT_SPEED,
    distance: DAGGER_DISTANCE,
  },
  {
    level: 2,
    name: "Triple Threat",
    description:
      "Adds a third blade plus extra reach and momentum for heavier hits.",
    count: 3,
    damage: DAGGER_DAMAGE + 1,
    rotSpeed: DAGGER_ROT_SPEED + 70,
    distance: DAGGER_DISTANCE + 20,
  },
  {
    level: 3,
    name: "Quintet",
    description:
      "Five daggers form a dense ring with even faster rotation and bite.",
    count: 5,
    damage: DAGGER_DAMAGE + 2,
    rotSpeed: DAGGER_ROT_SPEED + 140,
    distance: DAGGER_DISTANCE + 36,
  },
  {
    level: 4,
    name: "Blade Storm",
    description:
      "Seven blades surge at maximum speed, carving space around the player.",
    count: 7,
    damage: DAGGER_DAMAGE + 3,
    rotSpeed: DAGGER_ROT_SPEED + 200,
    distance: DAGGER_DISTANCE + 60,
  },
];

const findDaggerLevelDef = (level: number) =>
  DAGGER_LEVELS.find((def) => def.level === level);

export const getNextDaggerLevel = (currentLevel: number) =>
  findDaggerLevelDef(currentLevel + 1) ?? null;

export const applyDaggerLevel = (dagger: any, level: number) => {
  const def = findDaggerLevelDef(level);
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
  count: 2,
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
    description: "Unleash a single precise slash straight ahead.",
    slashCount: 1,
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
    description: "Adds two more cuts and tightens the cooldown.",
    slashCount: 3,
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

const findFastSwordLevelDef = (level: number) =>
  FAST_SWORD_LEVELS.find((def) => def.level === level) ?? null;

export const getNextFastSwordLevel = (currentLevel: number) => {
  if (currentLevel <= 0) return FAST_SWORD_LEVELS[0];
  return findFastSwordLevelDef(currentLevel + 1);
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

const findFireWandLevelDef = (level: number) =>
  FIRE_WAND_LEVELS.find((def) => def.level === level) ?? null;

export const getNextFireWandLevel = (currentLevel: number) => {
  if (currentLevel <= 0) return FIRE_WAND_LEVELS[0];
  return findFireWandLevelDef(currentLevel + 1);
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
    k.color(...PALETTE.secondary),
    k.outline(2, k.rgb(...lighten(PALETTE.secondary, 0.2))),
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
    console.log("Enemy died, dropping XP");
    const amount = Math.max(0, Math.round(enemy.data.exp ?? ENEMY_BASE.exp));
    if (amount > 0) {
      const origin = enemy.pos.clone ? enemy.pos.clone() : k.vec2(enemy.pos.x, enemy.pos.y);
      dropExp(k, player, amount, origin);
    }
  });

  enemy.onUpdate(() => {
    if (!isGameRunning()) return;
    if (levelUpState.active) return;
    const dir = unitVec(k, player.pos.sub(enemy.pos));
    enemy.move(dir.x * enemy.data.speed, dir.y * enemy.data.speed);
    if (enemy.touchTimer > 0) enemy.touchTimer -= k.dt();
  });

  return enemy;
};


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
    if (player && player.pos) {
      const dir = player.pos.sub(enemy.pos).unit();
      enemy.move(dir.scale(enemyData.speed));
    }

    // Attack timer
    attackTimer -= k.dt();
    if (attackTimer <= 0 && player && player.pos) {
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
    console.log("Ranged enemy died, dropping XP");
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

export const PLAYER_DATA: PlayerData = {
  kind: "player",
  speed: PLAYER_SPEED,
  maxHP: PLAYER_MAX_HP,
  facing: { x: 1, y: 0 },
};

export const createPlayer = (k: any) => {
  const player = k.add([
    k.pos(k.center()),
    k.rect(32, 32),
    k.color(...PALETTE.primary),
    k.outline(3, k.rgb(...lighten(PALETTE.primary, 0.35))),
    k.anchor("center"),
    k.area(),
    k.health(PLAYER_DATA.maxHP),
    "player",
    { data: { ...PLAYER_DATA }, _kbTween: null as any },
  ]);

  attachHealthLabel(k, player);
  createHealthBar(k, player);
  return player;
};


const EDGES: EdgeName[] = ["top", "bottom", "left", "right"];

const SPAWN_MARKER_TAG = "spawnPreview";

type WaveManagerHooks = {
  onWaveSpawn?: (wave: WaveConfig, index: number) => void;
};

const edgeSpawnPosition = (
  k: any,
  edge: EdgeName,
  ratio: number,
  padding: number
) => {
  const wMin = padding;
  const wMax = k.width() - padding;
  const hMin = padding;
  const hMax = k.height() - padding;

  switch (edge) {
    case "top":
      return k.vec2(wMin + (wMax - wMin) * ratio, hMin);
    case "bottom":
      return k.vec2(wMin + (wMax - wMin) * ratio, hMax);
    case "left":
      return k.vec2(wMin, hMin + (hMax - hMin) * ratio);
    case "right":
      return k.vec2(wMax, hMin + (hMax - hMin) * ratio);
    default:
      return k.vec2(k.center());
  }
};

const resolveSpawnPositions = (
  k: any,
  count: number,
  config: SpawnLocationConfig
) => {
  const positions: any[] = [];

  if (config.kind === "random") {
    const padding = config.padding ?? 48;
    for (let i = 0; i < count; i += 1) {
      positions.push(
        k.vec2(
          randRange(padding, k.width() - padding),
          randRange(padding, k.height() - padding)
        )
      );
    }
    return positions;
  }

  if (config.kind === "edge") {
    const padding = config.padding ?? 48;
    for (let i = 0; i < count; i += 1) {
      const edgeName =
        config.edge && config.edge !== "random"
          ? config.edge
          : EDGES[Math.floor(Math.random() * EDGES.length)];
      positions.push(
        edgeSpawnPosition(k, edgeName, distribute(i, count), padding)
      );
    }
    return positions;
  }

  if (config.kind === "points") {
    const pts =
      config.points.length > 0 ? config.points : [[k.center().x, k.center().y]];
    for (let i = 0; i < count; i += 1) {
      const [x, y] = pts[i % pts.length];
      positions.push(jitterVec(k, k.vec2(x, y), config.jitter));
    }
    return positions;
  }

  return positions;
};

const spawnEnemyGroup = (
  k: any,
  player: any,
  group: EnemyGroupConfig,
  positionsOverride?: any[]
) => {
  const clonePos = (p: any) => {
    if (!p) {
      const center = k.center();
      return k.vec2(center.x, center.y);
    }
    if (typeof p.clone === "function") return p.clone();
    if (typeof p.x === "number" && typeof p.y === "number") {
      return k.vec2(p.x, p.y);
    }
    if (Array.isArray(p) && p.length >= 2) {
      return k.vec2(p[0] ?? 0, p[1] ?? 0);
    }
    const fallback = k.center();
    return k.vec2(fallback.x, fallback.y);
  };

  const resolved: any[] = [];

  if (positionsOverride && positionsOverride.length > 0) {
    resolved.push(
      ...positionsOverride.slice(0, group.count).map((pos) => clonePos(pos))
    );
  }

  if (resolved.length < group.count) {
    const needed = group.count - resolved.length;
    const generated = resolveSpawnPositions(k, needed, group.spawn).map((pos) =>
      clonePos(pos)
    );
    resolved.push(...generated);
  }

  return resolved.slice(0, group.count).map((pos) => {
    if (group.enemyType === "ranged") {
      return createRangedEnemy(k, player, pos, {
        maxHP: group.hp,
        speed: group.speed,
        touchDamage: group.touchDamage,
        exp: group.exp,
      });
    } else if (group.enemyType === "bit") {
      return createBitEnemy(k, player, pos, {
        maxHP: group.hp,
        speed: group.speed,
        touchDamage: group.touchDamage,
        exp: group.exp,
      });
    } else {
      return createEnemy(k, player, pos, {
        hp: group.hp,
        speed: group.speed,
        touchDamage: group.touchDamage,
        exp: group.exp,
      });
    }
  });
};

export type WaveManager = ReturnType<typeof createWaveManager>;

export const createWaveManager = (
  k: any,
  player: any,
  hooks: WaveManagerHooks = {}
) => {
  const ARENA_CENTER = k.center();

  const spawnPreviewState: {
    waveIndex: number;
    groups: any[][];
    markers: any[];
  } = {
    waveIndex: -1,
    groups: [],
    markers: [],
  };

  const toVec = (pos: any) => {
    if (!pos) {
      const center = k.center();
      return k.vec2(center.x, center.y);
    }
    if (typeof pos.clone === "function") return pos.clone();
    if (typeof pos.x === "number" && typeof pos.y === "number") {
      return k.vec2(pos.x, pos.y);
    }
    if (Array.isArray(pos) && pos.length >= 2) {
      return k.vec2(pos[0] ?? 0, pos[1] ?? 0);
    }
    const fallback = k.center();
    return k.vec2(fallback.x, fallback.y);
  };

  const clearSpawnMarkers = () => {
    spawnPreviewState.markers.forEach((marker) => {
      if (marker) {
        k.destroy(marker);
      }
    });
    spawnPreviewState.markers = [];
    spawnPreviewState.groups = [];
    spawnPreviewState.waveIndex = -1;
  };

  const createSpawnMarker = (pos: any) => {
    const marker = k.add([
      k.pos(pos),
      k.rect(30, 30),
      k.anchor("center"),
      k.color(...PALETTE.dune),
      k.opacity(0.32),
      k.outline(2, k.rgb(...lighten(PALETTE.dune, 0.25))),
      SPAWN_MARKER_TAG,
      {
        pulseOffset: Math.random() * Math.PI * 2,
      },
    ]);

    marker.onUpdate(() => {
      const pulse = Math.sin(k.time() * 4 + (marker.pulseOffset ?? 0));
      marker.opacity = 0.26 + 0.1 * (pulse + 1) * 0.5;
    });

    spawnPreviewState.markers.push(marker);
    return marker;
  };

  const prepareWavePreview = (wave: WaveConfig, index: number) => {
    clearSpawnMarkers();
    const groups = wave.enemies.map((group) => {
      const positions = resolveSpawnPositions(k, group.count, group.spawn).map((pos) =>
        toVec(pos)
      );
      positions.forEach((pos) => createSpawnMarker(toVec(pos)));
      return positions;
    });
    spawnPreviewState.waveIndex = index;
    spawnPreviewState.groups = groups;
    return groups;
  };

  const takePreviewGroups = (index: number) => {
    if (spawnPreviewState.waveIndex !== index) {
      return null;
    }
    const groups = spawnPreviewState.groups.map((positions) =>
      positions.map((pos) => toVec(pos))
    );
    clearSpawnMarkers();
    return groups;
  };

  const WAVES: WaveConfig[] = [
    {
      name: "Warmup",
      delay: 1,
      enemies: [
        { count: 3, hp: 3, exp: 1, spawn: { kind: "edge", edge: "random" } },
        { count: 2, hp: 2, exp: 2, spawn: { kind: "random", padding: 96 } },
      ],
    },
    {
      name: "Encircle",
      delay: 1,
      enemies: [
        {
          count: 6,
          hp: 4,
          exp: 3,
          spawn: {
            kind: "points",
            points: [
              [ARENA_CENTER.x - 220, ARENA_CENTER.y],
              [ARENA_CENTER.x + 220, ARENA_CENTER.y],
              [ARENA_CENTER.x, ARENA_CENTER.y - 180],
              [ARENA_CENTER.x, ARENA_CENTER.y + 180],
            ],
            jitter: 36,
          },
        },
      ],
    },
    {
      name: "Rush",
      delay: 1,
      enemies: [
        {
          count: 8,
          hp: 5,
          speed: ENEMY_SPEED * 1.1,
          exp: 2,
          spawn: { kind: "edge", edge: "random" },
        },
      ],
    },
     {
       name: "Siege",
       delay: 1,
       enemies: [
         {
           count: 4,
           hp: 8,
           touchDamage: ENEMY_TOUCH_DAMAGE + 1,
           exp: 8,
           spawn: {
             kind: "points",
             points: [
               [120, 120],
               [680, 120],
               [120, 520],
               [680, 520],
             ],
             jitter: 24,
           },
         },
         {
           count: 10,
           hp: 4,
           speed: ENEMY_SPEED * 1.25,
           exp: 2,
           spawn: { kind: "edge", edge: "random", padding: 12 },
         },
         {
           count: 3,
           hp: 6,
           exp: 4,
           enemyType: "ranged",
           spawn: { kind: "random", padding: 150 },
         },
       ],
     },
    {
      name: "Crossfire",
      delay: 1,
      enemies: [
        {
          count: 8,
          hp: 5,
          exp: 3,
          spawn: { kind: "edge", edge: "random", padding: 32 },
        },
         {
           count: 4,
           hp: 7,
           exp: 5,
           enemyType: "ranged",
           spawn: {
             kind: "points",
             points: [
               [ARENA_CENTER.x - 260, ARENA_CENTER.y - 140],
               [ARENA_CENTER.x + 260, ARENA_CENTER.y + 140],
               [ARENA_CENTER.x - 260, ARENA_CENTER.y + 140],
               [ARENA_CENTER.x + 260, ARENA_CENTER.y - 140],
             ],
             jitter: 30,
           },
         },
      ],
    },
    {
      name: "Swarm",
      delay: 1,
      enemies: [
        {
          count: 14,
          hp: 3,
          speed: ENEMY_SPEED * 1.15,
          exp: 2,
          spawn: { kind: "edge", edge: "random", padding: 12 },
        },
        {
          count: 6,
          hp: 6,
          exp: 3,
          spawn: { kind: "random", padding: 110 },
        },
      ],
    },
    {
      name: "Bulwark",
      delay: 1,
      enemies: [
         {
           count: 6,
           hp: 12,
           touchDamage: ENEMY_TOUCH_DAMAGE + 1,
           exp: 8,
           enemyType: "ranged",
           spawn: {
             kind: "points",
             points: [
               [ARENA_CENTER.x - 200, ARENA_CENTER.y - 120],
               [ARENA_CENTER.x + 200, ARENA_CENTER.y - 120],
               [ARENA_CENTER.x - 200, ARENA_CENTER.y + 120],
               [ARENA_CENTER.x + 200, ARENA_CENTER.y + 120],
               [ARENA_CENTER.x, ARENA_CENTER.y - 200],
               [ARENA_CENTER.x, ARENA_CENTER.y + 200],
             ],
             jitter: 20,
           },
         },
        {
          count: 8,
          hp: 6,
          speed: ENEMY_SPEED * 1.3,
          exp: 4,
          spawn: { kind: "edge", edge: "random", padding: 20 },
        },
      ],
    },
     {
       name: "Finale",
       delay: 1,
       enemies: [
         {
           count: 12,
           hp: 7,
           speed: ENEMY_SPEED * 1.2,
           exp: 4,
           spawn: { kind: "edge", edge: "random", padding: 16 },
         },
          {
            count: 6,
            hp: 14,
            touchDamage: ENEMY_TOUCH_DAMAGE + 2,
            exp: 10,
            enemyType: "ranged",
            spawn: {
              kind: "points",
              points: [
                [ARENA_CENTER.x - 240, ARENA_CENTER.y],
                [ARENA_CENTER.x + 240, ARENA_CENTER.y],
                [ARENA_CENTER.x, ARENA_CENTER.y - 220],
                [ARENA_CENTER.x, ARENA_CENTER.y + 220],
                [ARENA_CENTER.x - 160, ARENA_CENTER.y - 160],
                [ARENA_CENTER.x + 160, ARENA_CENTER.y + 160],
              ],
              jitter: 24,
            },
          },
       ],
     },
     {
       name: "Stampede",
       delay: 1,
       enemies: [
         {
           count: 8,
           hp: 10,
           touchDamage: BIT_ENEMY_TOUCH_DAMAGE,
           exp: BIT_ENEMY_EXP,
           enemyType: "bit",
           spawn: { kind: "edge", edge: "random", padding: 32 },
         },
         {
           count: 6,
           hp: 6,
           speed: ENEMY_SPEED * 1.3,
           exp: 3,
           spawn: { kind: "random", padding: 120 },
         },
       ],
     },
  ];

  const waveState: {
    startedAt: number;
    index: number;
    running: boolean;
    phase: WavePhase;
    nextWaveAt: number | null;
    currentName: string;
  } = {
    startedAt: k.time(),
    index: -1,
    running: false,
    phase: "waiting",
    nextWaveAt: null,
    currentName: WAVES.length > 0 ? WAVES[0]?.name ?? "Wave 1" : "No waves",
  };

  const spawnWave = (
    wave: WaveConfig,
    index: number,
    groupPositions?: any[][]
  ) => {
    let positions = groupPositions;
    if (positions) {
      clearSpawnMarkers();
    } else {
      positions = takePreviewGroups(index) ?? undefined;
    }

    waveState.index = index;
    waveState.phase = "spawning";
    waveState.currentName = wave.name ?? `Wave ${index + 1}`;
    waveState.nextWaveAt = null;
    hooks.onWaveSpawn?.(wave, index);
    wave.enemies.forEach((group, groupIndex) =>
      spawnEnemyGroup(k, player, group, positions?.[groupIndex])
    );
  };

  const waitForGameplayWindow = () =>
    new Promise<void>((resolve) => {
      if (isGameRunning() && !levelUpState.active) {
        resolve();
        return;
      }
      const ticker = k.onUpdate(() => {
        if (!waveState.running) {
          ticker.cancel();
          resolve();
          return;
        }
        if (isGameRunning() && !levelUpState.active) {
          ticker.cancel();
          resolve();
        }
      });
    });

  const waitForDelay = (seconds: number) =>
    new Promise<void>((resolve) => {
      if (seconds <= 0) {
        waveState.nextWaveAt = null;
        resolve();
        return;
      }
      let remaining = seconds;
      waveState.nextWaveAt = k.time() + seconds;
      const ticker = k.onUpdate(() => {
        if (!waveState.running) {
          ticker.cancel();
          waveState.nextWaveAt = null;
          resolve();
          return;
        }
        if (!isGameRunning() || levelUpState.active) {
          return;
        }
        remaining -= k.dt();
        if (remaining <= 0) {
          waveState.nextWaveAt = null;
          ticker.cancel();
          resolve();
          return;
        }
        waveState.nextWaveAt = k.time() + Math.max(0, remaining);
      });
    });

  const waitForEnemiesClear = () =>
    new Promise<void>((resolve) => {
      waveState.phase = "clearing";
      if (getActiveEnemyCount() <= 0) {
        resolve();
        return;
      }
      const ticker = k.onUpdate(() => {
        if (!waveState.running) {
          ticker.cancel();
          resolve();
          return;
        }
        if (!isGameRunning() || levelUpState.active) {
          return;
        }
        if (getActiveEnemyCount() <= 0) {
          ticker.cancel();
          resolve();
        }
      });
    });

  const runWaveSequence = async () => {
    if (WAVES.length === 0) {
      waveState.phase = "done";
      waveState.currentName = "No waves configured";
      waveState.nextWaveAt = null;
      clearSpawnMarkers();
      return;
    }

    for (let i = 0; i < WAVES.length; i += 1) {
      const wave = WAVES[i];
      if (!waveState.running) break;

      await waitForGameplayWindow();
      waveState.phase = "waiting";
      waveState.currentName = wave.name ?? `Wave ${i + 1}`;
      const previewGroups = prepareWavePreview(wave, i);
      waveState.nextWaveAt = wave.delay > 0 ? k.time() + wave.delay : k.time();

      if (wave.delay > 0) {
        await waitForDelay(wave.delay);
      }

      if (!waveState.running) {
        clearSpawnMarkers();
        break;
      }
      await waitForGameplayWindow();
      spawnWave(wave, i, previewGroups);
      await waitForEnemiesClear();

      if (!waveState.running) break;
    }

    if (!waveState.running) {
      waveState.phase = "stopped";
    } else {
      waveState.phase = "done";
      waveState.nextWaveAt = null;
      waveState.currentName = "All Clear";
    }
    clearSpawnMarkers();
  };

  const resetWaveState = () => {
    clearSpawnMarkers();
    waveState.startedAt = k.time();
    waveState.index = -1;
    waveState.running = false;
    waveState.phase = "waiting";
    waveState.nextWaveAt = null;
    waveState.currentName = WAVES.length > 0 ? WAVES[0]?.name ?? "Wave 1" : "No waves";
  };

  let currentSequence: Promise<void> | null = null;

  const startWaves = () => {
    resetWaveState();
    waveState.running = true;
    waveState.startedAt = k.time();
    if (WAVES.length > 0) {
      const firstDelay = WAVES[0]?.delay ?? 0;
      waveState.nextWaveAt = firstDelay > 0 ? k.time() + firstDelay : k.time();
    } else {
      waveState.nextWaveAt = null;
    }
    currentSequence = runWaveSequence();
    currentSequence
      ?.catch((err) => console.error("Wave sequence halted", err))
      .finally(() => {
        currentSequence = null;
      });
    return currentSequence;
  };

  const stopWaves = () => {
    waveState.running = false;
    waveState.phase = "stopped";
    waveState.nextWaveAt = null;
    waveState.currentName = "Defeat";
    clearSpawnMarkers();
  };

  return {
    WAVES,
    waveState,
    runWaveSequence,
    startWaves,
    resetWaves: resetWaveState,
    stopWaves,
  };
};

export const createWaveHud = (k: any, waveManager: WaveManager) => {
  const waveHud = k.add([
    k.text("", { size: 20, align: "left" }),
    k.pos(16, 16),
    k.anchor("topleft"),
    k.color(...PALETTE.text),
    "ui",
  ]);

  waveHud.onUpdate(() => {
    const { WAVES, waveState } = waveManager;
    const gamePhase = getGamePhase();

    if (gamePhase === "start") {
      waveHud.text = "Ready\nPress Enter to begin";
      return;
    }

    const total = WAVES.length;
    const nextIn =
      gamePhase === "running" && waveState.nextWaveAt != null
        ? Math.max(0, waveState.nextWaveAt - k.time())
        : null;

    let status = "";
    if (gamePhase === "paused") {
      status = "Paused";
    } else {
      switch (waveState.phase) {
        case "waiting":
          status =
            nextIn != null && Number.isFinite(nextIn)
              ? `Next: ${waveState.currentName} in ${nextIn.toFixed(1)}s`
              : `Next: ${waveState.currentName}`;
          break;
        case "spawning":
          status = `Spawning ${waveState.currentName}`;
          break;
        case "clearing":
          status = `Enemies remaining: ${getActiveEnemyCount()}`;
          break;
        case "done":
          status = "All waves cleared";
          break;
        case "stopped":
          status = "Player defeated";
          break;
        default:
          status = waveState.currentName;
          break;
      }
    }

    let displayNumber = waveState.index + 1;
    if (waveState.phase === "waiting") {
      displayNumber = waveState.index + 2;
    }
    if (waveState.phase === "done") {
      displayNumber = total;
    }

    if (total > 0) {
      displayNumber = Math.min(Math.max(displayNumber, 1), total);
    }

    const waveLine =
      total > 0
        ? `Wave ${displayNumber}/${total}`
        : waveState.currentName ?? "No waves";

    const lines = [waveLine];
    if (status) {
      lines.push(status);
    }
    if (gamePhase === "paused") {
      lines.push("Press ESC to resume");
    }
    lines.push(`LVL ${playerStats.level} | Total XP: ${playerStats.totalExp}`);

    waveHud.text = lines.join("\n");
  });

  return waveHud;
};

type MenuHandlers = Array<{ cancel?: () => void }>;

type MenuActors = any[];

type MenuCallbacks = {
  onStart?: () => void;
  onResume?: () => void;
  onRestart?: () => void;
};

type GameOverInfo = {
  headline?: string;
  details?: string[];
};

const destroyActors = (k: any, actors: MenuActors) => {
  while (actors.length > 0) {
    const actor = actors.pop();
    if (actor) {
      k.destroy(actor);
    }
  }
};

const cancelHandlers = (handlers: MenuHandlers) => {
  while (handlers.length > 0) {
    const handler = handlers.pop();
    handler?.cancel?.();
  }
};

const registerHandler = (handlers: MenuHandlers, handler: any) => {
  if (handler && typeof handler.cancel === "function") {
    handlers.push(handler);
  }
};

export const createGameMenus = (k: any, callbacks: MenuCallbacks) => {
  const state = {
    startActors: [] as MenuActors,
    pauseActors: [] as MenuActors,
    gameOverActors: [] as MenuActors,
    startHandlers: [] as MenuHandlers,
    pauseHandlers: [] as MenuHandlers,
    gameOverHandlers: [] as MenuHandlers,
  };

  const center = () => k.center();
  const overlayColor = k.rgb(0, 0, 0);

  const showStartMenu = () => {
    if (state.startActors.length > 0) return;

    const { x, y } = center();
    const overlay = k.add([
      k.rect(k.width(), k.height()),
      k.pos(x, y),
      k.anchor("center"),
      k.color(overlayColor),
      k.opacity(0.82),
      k.fixed(),
      "ui",
    ]);

    const title = k.add([
      k.text("VERSE 8", {
        size: 48,
        align: "center",
        width: Math.max(320, k.width() - 160),
      }),
      k.pos(x, y - 120),
      k.anchor("center"),
      k.color(...PALETTE.accent),
      k.fixed(),
      "ui",
    ]);

    const instructions = [
      "Press Enter / Space / Click to begin",
      "WASD or Arrow Keys to move",
      "Defeat enemies to gain experience",
      "Press ESC to pause",
    ];

    const body = k.add([
      k.text(instructions.join("\n"), {
        size: 22,
        align: "center",
        width: Math.max(360, k.width() - 200),
        lineSpacing: 8,
      }),
      k.pos(x, y + 24),
      k.anchor("center"),
      k.color(...PALETTE.text),
      k.fixed(),
      "ui",
    ]);

    state.startActors.push(overlay, title, body);

    const triggerStart = () => {
      callbacks.onStart?.();
    };

    registerHandler(state.startHandlers, k.onKeyPress("enter", triggerStart));
    registerHandler(state.startHandlers, k.onKeyPress("space", triggerStart));
    registerHandler(state.startHandlers, k.onMousePress(triggerStart));
    registerHandler(
      state.startHandlers,
      k.onGamepadButtonPress?.("start", triggerStart)
    );
    registerHandler(
      state.startHandlers,
      k.onGamepadButtonPress?.("south", triggerStart)
    );
  };

  const hideStartMenu = () => {
    destroyActors(k, state.startActors);
    cancelHandlers(state.startHandlers);
  };

  const showPauseMenu = () => {
    if (state.pauseActors.length > 0) return;

    const { x, y } = center();
    const overlay = k.add([
      k.rect(k.width(), k.height()),
      k.pos(x, y),
      k.anchor("center"),
      k.color(overlayColor),
      k.opacity(0.7),
      k.fixed(),
      "ui",
    ]);

    const boxWidth = Math.min(k.width() - 120, 480);
    const panel = k.add([
      k.rect(boxWidth, 220),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...PALETTE.secondary),
      k.outline(3, k.rgb(...PALETTE.primary)),
      k.fixed(),
      "ui",
    ]);

    const lines = [
      "Paused",
      "",
      "Press Enter or Space to resume",
      "Press ESC to close the menu",
    ];

    const text = k.add([
      k.text(lines.join("\n"), {
        size: 24,
        align: "center",
        width: boxWidth - 48,
        lineSpacing: 10,
      }),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...PALETTE.text),
      k.fixed(),
      "ui",
    ]);

    state.pauseActors.push(overlay, panel, text);

    const triggerResume = () => {
      callbacks.onResume?.();
    };

    registerHandler(state.pauseHandlers, k.onKeyPress("enter", triggerResume));
    registerHandler(state.pauseHandlers, k.onKeyPress("space", triggerResume));
    registerHandler(state.pauseHandlers, k.onKeyPress("p", triggerResume));
    registerHandler(state.pauseHandlers, k.onMousePress(triggerResume));
    registerHandler(
      state.pauseHandlers,
      k.onGamepadButtonPress?.("start", triggerResume)
    );
    registerHandler(
      state.pauseHandlers,
      k.onGamepadButtonPress?.("south", triggerResume)
    );
  };

  const hidePauseMenu = () => {
    destroyActors(k, state.pauseActors);
    cancelHandlers(state.pauseHandlers);
  };

  const showGameOverMenu = (info?: GameOverInfo) => {
    if (state.gameOverActors.length > 0) return;

    const { x, y } = center();
    const overlay = k.add([
      k.rect(k.width(), k.height()),
      k.pos(x, y),
      k.anchor("center"),
      k.color(overlayColor),
      k.opacity(0.88),
      k.fixed(),
      "ui",
    ]);

    const boxWidth = Math.min(k.width() - 120, 520);
    const panel = k.add([
      k.rect(boxWidth, 260),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...PALETTE.secondary),
      k.outline(3, k.rgb(...PALETTE.accent)),
      k.fixed(),
      "ui",
    ]);

    const lines: string[] = [];
    lines.push(info?.headline ?? "Defeat");
    lines.push("");
    if (info?.details?.length) {
      lines.push(...info.details);
      lines.push("");
    }
    lines.push("Press Enter / Space / R to restart");

    const text = k.add([
      k.text(lines.join("\n"), {
        size: 24,
        align: "center",
        width: boxWidth - 56,
        lineSpacing: 10,
      }),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...PALETTE.text),
      k.fixed(),
      "ui",
    ]);

    state.gameOverActors.push(overlay, panel, text);

    const triggerRestart = () => {
      callbacks.onRestart?.();
    };

    registerHandler(state.gameOverHandlers, k.onKeyPress("enter", triggerRestart));
    registerHandler(state.gameOverHandlers, k.onKeyPress("space", triggerRestart));
    registerHandler(state.gameOverHandlers, k.onKeyPress("r", triggerRestart));
    registerHandler(state.gameOverHandlers, k.onMousePress(triggerRestart));
    registerHandler(
      state.gameOverHandlers,
      k.onGamepadButtonPress?.("start", triggerRestart)
    );
    registerHandler(
      state.gameOverHandlers,
      k.onGamepadButtonPress?.("south", triggerRestart)
    );
  };

  const hideGameOverMenu = () => {
    destroyActors(k, state.gameOverActors);
    cancelHandlers(state.gameOverHandlers);
  };

  return {
    showStartMenu,
    hideStartMenu,
    showPauseMenu,
    hidePauseMenu,
    showGameOverMenu,
    hideGameOverMenu,
  };
};


type UpgradeManagerHooks = {
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onUpgradeApplied?: () => void;
};

const levelUpMenuState: {
  panel: any;
  text: any;
  keyHandlers: any[];
  options: UpgradeOption[];
} = {
  panel: null,
  text: null,
  keyHandlers: [],
  options: [],
};

const formatStatDelta = (
  label: string,
  value: number,
  unit = ""
): string | null => {
  if (value === 0) return null;
  const prefix = value > 0 ? "+" : "";
  if (unit) {
    return `${prefix}${value}${unit} ${label}`;
  }
  return `${prefix}${value} ${label}`;
};

const buildDaggerUpgradeOption = (dagger: any): UpgradeOption | null => {
  const currentLevel = dagger.data.level ?? 1;
  const nextDef = getNextDaggerLevel(currentLevel);
  if (!nextDef) return null;

  const prevDef =
    DAGGER_LEVELS.find((def) => def.level === currentLevel) ?? DAGGER_LEVELS[0];
  const countDelta = nextDef.count - prevDef.count;
  const damageDelta = nextDef.damage - prevDef.damage;
  const speedDelta = nextDef.rotSpeed - prevDef.rotSpeed;
  const distanceDelta = nextDef.distance - prevDef.distance;

  const deltas = [
    formatStatDelta(
      `dagger${Math.abs(countDelta) === 1 ? "" : "s"}`,
      countDelta
    ),
    formatStatDelta("damage", damageDelta),
    formatStatDelta("spin", speedDelta, "°/s"),
    formatStatDelta("radius", distanceDelta),
  ].filter(Boolean);

  const statsText = deltas.length > 0 ? ` (${deltas.join(", ")})` : "";

  return {
    id: `dagger-level-${nextDef.level}`,
    name: `${nextDef.name} (Lv.${nextDef.level})`,
    description: `${nextDef.description}${statsText}`,
    apply: () => {
      applyDaggerDefinition(dagger, nextDef);
    },
  };
};

const buildFastSwordUpgradeOption = (sword: any): UpgradeOption | null => {
  const currentLevel = sword.data.level ?? 0;
  const nextDef = getNextFastSwordLevel(currentLevel);
  if (!nextDef) return null;

  return {
    id: `fast-sword-level-${nextDef.level}`,
    name: `${nextDef.name} (Lv.${nextDef.level})`,
    description: nextDef.description,
    apply: () => {
      applyFastSwordDefinition(sword, nextDef);
    },
  };
};

const buildFireWandUpgradeOption = (fireWand: any): UpgradeOption | null => {
  const currentLevel = fireWand.data.level ?? 0;
  const nextDef = getNextFireWandLevel(currentLevel);
  if (!nextDef) return null;

  const prevDef =
    FIRE_WAND_LEVELS.find((def) => def.level === currentLevel) ?? FIRE_WAND_LEVELS[0];
  const projectileDelta = nextDef.projectileCount - prevDef.projectileCount;
  const damageDelta = nextDef.damage - prevDef.damage;
  const sizeDelta = nextDef.projectileSize - prevDef.projectileSize;

  const deltas = [
    formatStatDelta(
      `projectile${Math.abs(projectileDelta) === 1 ? "" : "s"}`,
      projectileDelta
    ),
    formatStatDelta("damage", damageDelta),
    formatStatDelta("size", sizeDelta),
  ].filter(Boolean);

  const statsText = deltas.length > 0 ? ` (${deltas.join(", ")})` : "";

  return {
    id: `fire-wand-level-${nextDef.level}`,
    name: `${nextDef.name} (Lv.${nextDef.level})`,
    description: `${nextDef.description}${statsText}`,
    apply: () => {
      applyFireWandDefinition(fireWand, nextDef);
    },
  };
};

const buildUpgradePool = (dagger: any, sword: any, fireWand: any): UpgradeOption[] => {
  const pool: UpgradeOption[] = [];

  const daggerUpgrade = buildDaggerUpgradeOption(dagger);
  if (daggerUpgrade) {
    pool.push(daggerUpgrade);
  }

  const swordUpgrade = buildFastSwordUpgradeOption(sword);
  if (swordUpgrade) {
    pool.push(swordUpgrade);
  }

  const fireWandUpgrade = buildFireWandUpgradeOption(fireWand);
  if (fireWandUpgrade) {
    pool.push(fireWandUpgrade);
  }

  return pool;
};

const pickUpgradeOptions = (
  pool: UpgradeOption[],
  count: number
): UpgradeOption[] => {
  const available = [...pool];
  for (let i = available.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available.slice(0, Math.min(count, available.length));
};

const cleanupLevelUpMenu = (k: any) => {
  levelUpMenuState.keyHandlers.forEach((handler) => handler.cancel?.());
  levelUpMenuState.keyHandlers = [];
  if (levelUpMenuState.text) {
    k.destroy(levelUpMenuState.text);
    levelUpMenuState.text = null;
  }
  if (levelUpMenuState.panel) {
    k.destroy(levelUpMenuState.panel);
    levelUpMenuState.panel = null;
  }
  levelUpMenuState.options = [];
};

export const createUpgradeManager = (
  k: any,
  dagger: any,
  fastSword: any,
  fireWand: any,
  refreshXpBar: () => void,
  hooks: UpgradeManagerHooks = {}
) => {
  const showLevelUpMenu = (options: UpgradeOption[]) => {
    cleanupLevelUpMenu(k);
    if (options.length === 0) {
      finishLevelUpChoice();
      return;
    }

    hooks.onMenuOpen?.();

    const panelWidth = 520;
    const panelHeight = 240;
    const center = k.center();

    levelUpMenuState.panel = k.add([
      k.rect(panelWidth, panelHeight),
      k.pos(center.x, center.y),
      k.anchor("center"),
      k.color(...PALETTE.secondary),
      k.outline(2, k.rgb(...lighten(PALETTE.secondary, 0.4))),
      k.fixed(),
      "ui",
    ]);

    const textLines = ["LEVEL UP!", ""];
    options.forEach((opt, idx) => {
      textLines.push(`${idx + 1}. ${opt.name} - ${opt.description}`);
    });
    if (options.length === 1) {
      textLines.push("", "Press 1 to choose");
    } else {
      textLines.push("", `Press 1-${options.length} to choose`);
    }

    levelUpMenuState.text = k.add([
      k.text(textLines.join("\n"), {
        size: 20,
        align: "left",
        width: panelWidth - 32,
        lineSpacing: 6,
      }),
      k.pos(center.x - panelWidth / 2 + 16, center.y - panelHeight / 2 + 16),
      k.anchor("topleft"),
      k.color(...PALETTE.text),
      k.fixed(),
      "ui",
    ]);

    options.forEach((opt, idx) => {
      const key = `${idx + 1}`;
      const handler = k.onKeyPress(key, () => applyUpgradeOption(opt));
      levelUpMenuState.keyHandlers.push(handler);
    });
  };

  function startLevelUpChoice() {
    if (!consumePendingLevelUp()) return;

    setLevelUpActive(true);
    const pool = buildUpgradePool(dagger, fastSword, fireWand);
    const options = pickUpgradeOptions(pool, 3);
    levelUpMenuState.options = options;
    showLevelUpMenu(options);
  }

  function finishLevelUpChoice() {
    const wasVisible = Boolean(levelUpMenuState.panel || levelUpMenuState.text);
    setLevelUpActive(false);
    cleanupLevelUpMenu(k);
    if (wasVisible) {
      hooks.onMenuClose?.();
    }
    if (levelUpState.pending > 0) {
      startLevelUpChoice();
    }
  }

  function applyUpgradeOption(option: UpgradeOption) {
    option.apply();
    hooks.onUpgradeApplied?.();
    refreshXpBar();
    finishLevelUpChoice();
  }

  const handleLevelUpQueued = () => {
    if (!levelUpState.active) {
      startLevelUpChoice();
    }
  };

  onLevelUpQueued(handleLevelUpQueued);

  return {
    startLevelUpChoice,
    finishLevelUpChoice,
    cancelMenu: () => {
      const wasVisible = Boolean(levelUpMenuState.panel || levelUpMenuState.text);
      cleanupLevelUpMenu(k);
      if (wasVisible) {
        hooks.onMenuClose?.();
      }
    },
  };
};


const k = kaplay({
  backgroundAudio: true,
  background: [11, 8, 4],
  width: ARENA_WIDTH,
  height: ARENA_HEIGHT,
  canvas: document.querySelector("canvas") ?? undefined,
});

k.volume(0.6);

const audio = createAudioManager(k);

const player = createPlayer(k);
const dagger = createDagger(k, player);
const fastSword = createFastSword(k, player);
const fireWand = createFireWand(k, player);

const { updateXpBarUI } = createXpBar(k);
const upgradeManager = createUpgradeManager(
  k,
  dagger,
  fastSword,
  fireWand,
  updateXpBarUI,
  {
    onMenuOpen: () => {
      audio.fadeAmbientTo(0.16, 0.4);
      audio.playUpgradeOpen();
    },
    onMenuClose: () => {
      audio.fadeAmbientTo(0.24, 0.5);
    },
    onUpgradeApplied: () => {
      audio.playUpgradeConfirm();
    },
  }
);

const waveManager = createWaveManager(k, player, {
  onWaveSpawn: () => {
    audio.playWaveSpawn();
  },
});
createWaveHud(k, waveManager);

let runStartTime = 0;
let menus: ReturnType<typeof createGameMenus>;

const destroyByTag = (tag: string) => {
  k.get(tag).forEach((obj: any) => {
    k.destroy(obj);
  });
};

const resetRunState = (options: { showStartMenu?: boolean } = {}) => {
  upgradeManager.cancelMenu();
  waveManager.stopWaves();
  waveManager.resetWaves();

  destroyByTag("enemy");
  destroyByTag("fastSwordSlash");
  destroyByTag("expShard");
  destroyByTag("healthLabel");
  destroyByTag("healthBar");

  const center = k.center();
  if (typeof player.setHP === "function") {
    player.setHP(player.data.maxHP);
  }
  player.pos.x = center.x;
  player.pos.y = center.y;
  player.data.facing = { x: 1, y: 0 };

  dagger.rotation = 0;
  dagger.data.rotation = 0;
  applyDaggerLevel(dagger, DAGGER_DATA.level);
  dagger.syncBladeLayout?.();

  Object.assign(fastSword.data, { ...FAST_SWORD_DATA });
  fastSword.resetAttackTimer?.();

  Object.assign(fireWand.data, { ...FIRE_WAND_DATA });
  fireWand.resetAttackTimer?.();

  initPlayerProgression();
  updateXpBarUI();

  resetToStart();
  runStartTime = 0;

  audio.fadeAmbientTo(0.12, 0.8);

  menus?.hidePauseMenu();
  menus?.hideGameOverMenu();
  if (options.showStartMenu !== false) {
    menus?.showStartMenu();
  } else {
    menus?.hideStartMenu();
  }
};

const resumeFromPause = () => {
  if (getGamePhase() !== "paused") return;
  resumeGameplay();
  audio.resumeAmbient();
  audio.fadeAmbientTo(0.24, 0.4);
  audio.playUiConfirm();
  menus?.hidePauseMenu();
};

const startRun = () => {
  if (getGamePhase() === "running") return;
  menus?.hideStartMenu();
  menus?.hidePauseMenu();
  menus?.hideGameOverMenu();
  audio.startAmbient();
  audio.resumeAmbient();
  audio.fadeAmbientTo(0.24, 1.1);
  audio.playUiConfirm();
  startGameplay();
  runStartTime = k.time();
  waveManager.startWaves();
};

const togglePauseMenu = () => {
  if (levelUpState.active) return;
  const phase = getGamePhase();
  if (phase === "start" || phase === "gameover") return;
  if (phase === "paused") {
    resumeFromPause();
  } else if (phase === "running") {
    pauseGameplay();
    audio.fadeAmbientTo(0.14, 0.5);
    audio.playUiConfirm();
    menus?.showPauseMenu();
  }
};

const handleStart = () => {
  if (getGamePhase() !== "start") return;
  startRun();
};

const handleRestart = () => {
  resetRunState({ showStartMenu: false });
  // Recreate health bar after reset
  createHealthBar(k, player);
  startRun();
};

menus = createGameMenus(k, {
  onStart: handleStart,
  onResume: resumeFromPause,
  onRestart: handleRestart,
});

 resetRunState({ showStartMenu: true });

 // Recreate health bar after reset
 createHealthBar(k, player);

player.on("death", () => {
  waveManager.stopWaves();
  upgradeManager.cancelMenu();
  markGameOver();
  audio.fadeAmbientTo(0.1, 1.2);
  audio.playUiConfirm();
  menus?.hidePauseMenu();

  const { waveState, WAVES } = waveManager;
  const totalWaves = WAVES.length;
  let waveNumber = waveState.index + 1;
  if (waveNumber <= 0) waveNumber = 1;
  if (totalWaves > 0) {
    waveNumber = Math.min(waveNumber, totalWaves);
  }
  const survivalSeconds =
    runStartTime > 0 ? Math.max(0, k.time() - runStartTime) : 0;
  const details: string[] = [];
  details.push(
    totalWaves > 0
      ? `Wave ${waveNumber}/${totalWaves}`
      : waveState.currentName ?? "No waves"
  );
  details.push(`Level ${playerStats.level}`);
  details.push(`Total XP ${playerStats.totalExp}`);
  details.push(`Survived ${survivalSeconds.toFixed(1)}s`);

  menus?.showGameOverMenu({ details });
});

k.onKeyPress("escape", togglePauseMenu);
k.onKeyPress("p", togglePauseMenu);
k.onGamepadButtonPress?.("start", togglePauseMenu);

// === Combat ===
k.onCollide("dagger", "enemy", (_d: any, enemy: any) => {
  if (!isGameRunning()) return;
  console.log(`Dagger hit enemy, damage: ${dagger.data.damage}, enemy health before: ${enemy.hp()}`);
  enemy.hurt(dagger.data.damage);
  console.log(`Enemy health after: ${enemy.hp()}`);
  knockback(k, enemy, player.pos, DAGGER_KNOCKBACK_DIST);
  if (Math.random() < 0.85) {
    audio.playEnemyHit();
  }
});

k.onCollide("fastSwordSlash", "enemy", (slash: any, enemy: any) => {
  if (!isGameRunning()) return;
  if (!slash.hitTargets) {
    slash.hitTargets = new Set();
  }
  if (slash.hitTargets.has(enemy)) return;
  slash.hitTargets.add(enemy);
  const damage = Math.max(0, slash.damage ?? 0);
  if (damage > 0) {
    console.log(`Fast sword hit enemy, damage: ${damage}, enemy health before: ${enemy.hp()}`);
    enemy.hurt(damage);
    console.log(`Enemy health after: ${enemy.hp()}`);
  }
  knockback(k, enemy, slash.pos ?? player.pos);
  if (damage > 0 && Math.random() < 0.7) {
    audio.playEnemyHit();
  }
});

k.onCollide("fireWandProjectile", "enemy", (projectile: any, enemy: any) => {
  if (!isGameRunning()) return;
  if (!projectile.hitTargets) {
    projectile.hitTargets = new Set();
  }
  if (projectile.hitTargets.has(enemy)) return;
  projectile.hitTargets.add(enemy);
  const damage = Math.max(0, projectile.damage ?? 0);
  if (damage > 0) {
    console.log(`Fire wand hit enemy, damage: ${damage}, enemy health before: ${enemy.hp()}`);
    enemy.hurt(damage);
    console.log(`Enemy health after: ${enemy.hp()}`);
  }
  knockback(k, enemy, projectile.pos ?? player.pos);
  if (damage > 0 && Math.random() < 0.8) {
    audio.playEnemyHit();
  }
  k.destroy(projectile);
});

k.onCollide("enemy", "player", (enemy: any, p: any) => {
  if (!isGameRunning()) return;
  if (levelUpState.active) return;
  if (enemy.touchTimer > 0) return;
  enemy.touchTimer = TOUCH_COOLDOWN;
  p.hurt(enemy.data.touchDamage);
  knockback(k, p, enemy.pos);
  audio.playPlayerHit();
});

k.onCollide("player", "expShard", (_player: any, shard: any) => {
  if (!isGameRunning()) return;
  const value = Math.max(0, Math.round(shard.expValue ?? 0));
  if (value > 0) {
    grantExp(value);
    updateXpBarUI();
    audio.playXpPickup();
  }
  k.destroy(shard);
});

k.on("death", "enemy", (enemy: any) => k.destroy(enemy));

// === Movement ===
const moveBy = (dx = 0, dy = 0) => {
  if (!isGameRunning()) return;
  if (levelUpState.active) return;
  const dir = k.vec2(dx, dy);
  const len = dir.len();
  if (len > 0.01) {
    const unit = dir.unit();
    player.data.facing = { x: unit.x, y: unit.y };
    const magnitude = Math.min(1, len);
    player.move(
      unit.x * player.data.speed * magnitude,
      unit.y * player.data.speed * magnitude
    );
  }
};

k.onKeyDown("w", () => moveBy(0, -1));
k.onKeyDown("s", () => moveBy(0, 1));
k.onKeyDown("a", () => moveBy(-1, 0));
k.onKeyDown("d", () => moveBy(1, 0));
k.onKeyDown("up", () => moveBy(0, -1));
k.onKeyDown("down", () => moveBy(0, 1));
k.onKeyDown("left", () => moveBy(-1, 0));
k.onKeyDown("right", () => moveBy(1, 0));
k.onGamepadStick("left", (v) => moveBy(v.x, v.y));
