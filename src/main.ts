import kaplay from "kaplay";
const k = kaplay({
  background: [0, 0, 0],
  width: 800,
  height: 600,
  canvas: document.querySelector("canvas") ?? undefined,
});
// === Tunables ===
const PLAYER_SPEED = 320;
const DAGGER_ROT_SPEED = 200;
const DAGGER_DAMAGE = 1;
const ENEMY_SPEED = 90;
const ENEMY_TOUCH_DAMAGE = 1;
const KNOCKBACK_DIST = 36;
const KNOCKBACK_TIME = 0.12;
const TOUCH_COOLDOWN = 0.4;

// === Entity data shapes ===
type PlayerData = {
  kind: "player";
  speed: number;
  maxHP: number;
};
type EnemyData = {
  kind: "enemy";
  speed: number;
  touchDamage: number;
  maxHP: number;
};
type DaggerData = {
  kind: "dagger";
  damage: number;
  rotSpeed: number;
  distance: number;
};

type EdgeName = "top" | "bottom" | "left" | "right";
type SpawnLocationConfig =
  | { kind: "random"; padding?: number }
  | { kind: "edge"; edge?: EdgeName | "random"; padding?: number }
  | { kind: "points"; points: [number, number][]; jitter?: number };

type EnemyGroupConfig = {
  count: number;
  hp?: number;
  speed?: number;
  touchDamage?: number;
  spawn: SpawnLocationConfig;
};

type WaveConfig = {
  name?: string;
  delay: number;
  enemies: EnemyGroupConfig[];
  repeat?: number;
};

type WavePhase = "waiting" | "spawning" | "clearing" | "done" | "stopped";

// === Default data ===
const PLAYER_DATA: PlayerData = {
  kind: "player",
  speed: PLAYER_SPEED,
  maxHP: 5,
};
const ENEMY_BASE = {
  kind: "enemy",
  speed: ENEMY_SPEED,
  touchDamage: ENEMY_TOUCH_DAMAGE,
} as const;
const DAGGER_DATA: DaggerData = {
  kind: "dagger",
  damage: DAGGER_DAMAGE,
  rotSpeed: DAGGER_ROT_SPEED,
  distance: 40,
};

let activeEnemyCount = 0;
const enemiesAlive = new Set<any>();

function registerEnemy(enemy: any) {
  activeEnemyCount += 1;
  enemiesAlive.add(enemy);

  enemy.on("death", () => {
    if (enemiesAlive.delete(enemy)) {
      activeEnemyCount = Math.max(0, activeEnemyCount - 1);
    }
  });

  enemy.on("destroy", () => {
    if (enemiesAlive.delete(enemy)) {
      activeEnemyCount = Math.max(0, activeEnemyCount - 1);
    }
  });
}

// === Utils ===
const unit = (v: any) => (v.len() > 0 ? v.unit() : k.vec2(0.0, 0));
const readHP = (o: any) => (typeof o.hp === "function" ? o.hp() : o.hp);
const readMax = (o: any) => {
  if (o?.data?.maxHP != null) return o.data.maxHP;
  const m = typeof o.maxHP === "function" ? o.maxHP() : o.maxHP;
  if (m != null) return m;
  // As a last resort, keep it explicit rather than silently wrong.
  // You can return 0 if you prefer, but don't use current HP.
  return 0;
};

function attachHealthLabel(target: any, yOffset = -28) {
  const label = k.add([
    k.text("", { size: 12 }),
    k.pos(target.pos.x, target.pos.y + yOffset),
    k.color(255, 255, 255),
    k.anchor("center"),
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
  refresh();
}

function knockback(obj: any, fromPos: any, dist = KNOCKBACK_DIST) {
  const dir = unit(obj.pos.sub(fromPos));
  const to = obj.pos.add(dir.scale(dist));
  if (obj._kbTween && obj._kbTween.cancel) obj._kbTween.cancel();
  obj._kbTween = k.tween(
    obj.pos,
    to,
    KNOCKBACK_TIME,
    (p) => (obj.pos = p),
    k.easings.easeOutCubic
  );
}

// === Player ===
const player = k.add([
  k.pos(k.center()),
  k.rect(32, 32),
  k.color(255, 255, 255),
  k.anchor("center"),
  k.area(),
  k.health(PLAYER_DATA.maxHP),
  "player",
  { data: { ...PLAYER_DATA }, _kbTween: null as any },
]);
attachHealthLabel(player);

// === Dagger ===
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
  dagger.angle += dagger.data.rotSpeed * k.dt();
  const offset = k.Vec2.fromAngle(dagger.angle).scale(dagger.data.distance);
  dagger.pos = player.pos.add(offset);
});

// === Enemies ===
type EnemyOverrides = {
  hp?: number;
  speed?: number;
  touchDamage?: number;
};

function makeEnemy(p: any, overrides: EnemyOverrides = {}) {
  const maxHP = overrides.hp ?? 4;
  const enemyData: EnemyData = {
    kind: "enemy",
    speed: overrides.speed ?? ENEMY_BASE.speed,
    touchDamage: overrides.touchDamage ?? ENEMY_BASE.touchDamage,
    maxHP,
  };

  const e = k.add([
    k.pos(p),
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

  attachHealthLabel(e, -24);
  registerEnemy(e);

  e.onUpdate(() => {
    const dir = unit(player.pos.sub(e.pos));
    e.move(dir.x * e.data.speed, dir.y * e.data.speed);
    if (e.touchTimer > 0) e.touchTimer -= k.dt();
  });

  return e;
}

const EDGES: EdgeName[] = ["top", "bottom", "left", "right"];

const randRange = (min: number, max: number) => min + Math.random() * (max - min);

const distribute = (idx: number, count: number) =>
  count <= 1 ? 0.5 : idx / (count - 1);

function jitterVec(v: any, jitter = 0) {
  if (!jitter) return k.vec2(v.x, v.y);
  return k.vec2(v.x + randRange(-jitter, jitter), v.y + randRange(-jitter, jitter));
}

function edgeSpawnPosition(edge: EdgeName, ratio: number, padding: number) {
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
}

function resolveSpawnPositions(count: number, config: SpawnLocationConfig) {
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
      positions.push(edgeSpawnPosition(edgeName, distribute(i, count), padding));
    }
    return positions;
  }

  if (config.kind === "points") {
    const pts = config.points.length > 0 ? config.points : [[k.center().x, k.center().y]];
    for (let i = 0; i < count; i += 1) {
      const [x, y] = pts[i % pts.length];
      positions.push(jitterVec(k.vec2(x, y), config.jitter));
    }
    return positions;
  }

  return positions;
}

function spawnEnemyGroup(group: EnemyGroupConfig) {
  const positions = resolveSpawnPositions(group.count, group.spawn);
  return positions.map((pos) =>
    makeEnemy(pos, {
      hp: group.hp,
      speed: group.speed,
      touchDamage: group.touchDamage,
    })
  );
}

const ARENA_CENTER = k.center();

const WAVES: WaveConfig[] = [
  {
    name: "Warmup",
    delay: 1.5,
    enemies: [
      { count: 3, hp: 3, spawn: { kind: "edge", edge: "random" } },
      { count: 2, hp: 2, spawn: { kind: "random", padding: 96 } },
    ],
  },
  {
    name: "Encircle",
    delay: 6,
    enemies: [
      {
        count: 6,
        hp: 4,
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
    delay: 7,
    enemies: [
      {
        count: 8,
        hp: 5,
        speed: ENEMY_SPEED * 1.1,
        spawn: { kind: "edge", edge: "random" },
      },
    ],
  },
  {
    name: "Finale",
    delay: 8,
    enemies: [
      {
        count: 4,
        hp: 8,
        touchDamage: ENEMY_TOUCH_DAMAGE + 1,
        spawn: { kind: "points", points: [[120, 120], [680, 120], [120, 520], [680, 520]], jitter: 24 },
      },
      {
        count: 10,
        hp: 4,
        speed: ENEMY_SPEED * 1.25,
        spawn: { kind: "edge", edge: "random", padding: 12 },
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
  running: true,
  phase: "waiting" as WavePhase,
  nextWaveAt: WAVES.length > 0 ? k.time() + (WAVES[0]?.delay ?? 0) : null,
  currentName: WAVES.length > 0 ? WAVES[0]?.name ?? "Wave 1" : "No waves",
};

function spawnWave(wave: WaveConfig, index: number) {
  waveState.index = index;
  waveState.phase = "spawning";
  waveState.currentName = wave.name ?? `Wave ${index + 1}`;
  waveState.nextWaveAt = null;
  wave.enemies.forEach((group) => spawnEnemyGroup(group));
}

async function waitForEnemiesClear(pollSeconds = 0.25) {
  waveState.phase = "clearing";
  while (waveState.running && activeEnemyCount > 0) {
    await k.wait(pollSeconds);
  }
}

async function runWaveSequence() {
  if (WAVES.length === 0) {
    waveState.phase = "done";
    waveState.currentName = "No waves configured";
    waveState.nextWaveAt = null;
    return;
  }

  for (let i = 0; i < WAVES.length; i += 1) {
    const wave = WAVES[i];
    if (!waveState.running) break;

    waveState.phase = "waiting";
    waveState.currentName = wave.name ?? `Wave ${i + 1}`;
    waveState.nextWaveAt = wave.delay > 0 ? k.time() + wave.delay : k.time();

    if (wave.delay > 0) {
      await k.wait(wave.delay);
    }

    if (!waveState.running) break;
    spawnWave(wave, i);
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
}

player.on("death", () => {
  waveState.running = false;
  waveState.phase = "stopped";
  waveState.nextWaveAt = null;
  waveState.currentName = "Defeat";
});

runWaveSequence().catch((err) => console.error("Wave sequence halted", err));

const waveHud = k.add([
  k.text("", { size: 20, align: "left" }),
  k.pos(16, 16),
  k.anchor("topleft"),
  k.color(240, 240, 240),
  "ui",
]);

waveHud.onUpdate(() => {
  const total = WAVES.length;
  const nextIn =
    waveState.nextWaveAt != null ? Math.max(0, waveState.nextWaveAt - k.time()) : null;

  let status = "";
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
      status = `Enemies remaining: ${activeEnemyCount}`;
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
    total > 0 ? `Wave ${displayNumber}/${total}` : waveState.currentName ?? "No waves";
  const lines = [waveLine, status].filter(Boolean);
  waveHud.text = lines.join("\n");
});

// === Combat (now uses data on objects) ===
k.onCollide("dagger", "enemy", (_d: any, enemy: any) => {
  enemy.hurt(dagger.data.damage);
  knockback(enemy, player.pos);
});

k.onCollide("enemy", "player", (enemy: any, p: any) => {
  if (enemy.touchTimer > 0) return;
  enemy.touchTimer = TOUCH_COOLDOWN;
  p.hurt(enemy.data.touchDamage);
  knockback(p, enemy.pos);
});

// auto-clean enemy on death
k.on("death", "enemy", (enemy: any) => k.destroy(enemy));

// === Movement (reads player speed from data) ===
const moveBy = (dx = 0, dy = 0) =>
  player.move(dx * player.data.speed, dy * player.data.speed);
k.onKeyDown("w", () => moveBy(0, -1));
k.onKeyDown("s", () => moveBy(0, 1));
k.onKeyDown("a", () => moveBy(-1, 0));
k.onKeyDown("d", () => moveBy(1, 0));
k.onKeyDown("up", () => moveBy(0, -1));
k.onKeyDown("down", () => moveBy(0, 1));
k.onKeyDown("left", () => moveBy(-1, 0));
k.onKeyDown("right", () => moveBy(1, 0));
k.onGamepadStick("left", (v) => moveBy(v.x, v.y));
