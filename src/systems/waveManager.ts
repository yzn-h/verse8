import { ENEMY_SPEED, ENEMY_TOUCH_DAMAGE } from "../config/constants";
import { PALETTE } from "../config/palette";
import type {
  EdgeName,
  EnemyGroupConfig,
  SpawnLocationConfig,
  WaveConfig,
  WavePhase,
} from "../config/types";
import { lighten } from "../utils/color";
import { distribute, randRange } from "../utils/math";
import { jitterVec } from "../utils/vector";
import { createEnemy } from "../entities/enemy";
import { getActiveEnemyCount } from "./enemyManager";
import { isGameRunning } from "./gameState";
import { levelUpState } from "./playerProgression";

const EDGES: EdgeName[] = ["top", "bottom", "left", "right"];

const SPAWN_MARKER_TAG = "spawnPreview";

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

  return resolved.slice(0, group.count).map((pos) =>
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
