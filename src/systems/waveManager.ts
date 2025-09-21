import { ENEMY_SPEED, ENEMY_TOUCH_DAMAGE } from "../config/constants";
import type {
  EdgeName,
  EnemyGroupConfig,
  SpawnLocationConfig,
  WaveConfig,
  WavePhase,
} from "../config/types";
import { distribute, randRange } from "../utils/math";
import { jitterVec } from "../utils/vector";
import { createEnemy } from "../entities/enemy";
import { getActiveEnemyCount } from "./enemyManager";

const EDGES: EdgeName[] = ["top", "bottom", "left", "right"];

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

const spawnEnemyGroup = (k: any, player: any, group: EnemyGroupConfig) => {
  const positions = resolveSpawnPositions(k, group.count, group.spawn);
  return positions.map((pos) =>
    createEnemy(k, player, pos, {
      hp: group.hp,
      speed: group.speed,
      touchDamage: group.touchDamage,
      exp: group.exp,
    })
  );
};

export type WaveManager = ReturnType<typeof createWaveManager>;

export const createWaveManager = (k: any, player: any) => {
  const ARENA_CENTER = k.center();

  const WAVES: WaveConfig[] = [
    {
      name: "Warmup",
      delay: 1.5,
      enemies: [
        { count: 3, hp: 3, exp: 1, spawn: { kind: "edge", edge: "random" } },
        { count: 2, hp: 2, exp: 2, spawn: { kind: "random", padding: 96 } },
      ],
    },
    {
      name: "Encircle",
      delay: 6,
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
      delay: 7,
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
      name: "Finale",
      delay: 8,
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
    phase: "waiting",
    nextWaveAt: WAVES.length > 0 ? k.time() + (WAVES[0]?.delay ?? 0) : null,
    currentName: WAVES.length > 0 ? WAVES[0]?.name ?? "Wave 1" : "No waves",
  };

  const spawnWave = (wave: WaveConfig, index: number) => {
    waveState.index = index;
    waveState.phase = "spawning";
    waveState.currentName = wave.name ?? `Wave ${index + 1}`;
    waveState.nextWaveAt = null;
    wave.enemies.forEach((group) => spawnEnemyGroup(k, player, group));
  };

  const waitForEnemiesClear = async (pollSeconds = 0.25) => {
    waveState.phase = "clearing";
    while (waveState.running && getActiveEnemyCount() > 0) {
      await k.wait(pollSeconds);
    }
  };

  const runWaveSequence = async () => {
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
  };

  const stopWaves = () => {
    waveState.running = false;
    waveState.phase = "stopped";
    waveState.nextWaveAt = null;
    waveState.currentName = "Defeat";
  };

  return {
    WAVES,
    waveState,
    runWaveSequence,
    stopWaves,
  };
};
