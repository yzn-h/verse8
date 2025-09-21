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
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
