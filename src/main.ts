import kaplay from "kaplay";

import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  DAGGER_KNOCKBACK_DIST,
  TOUCH_COOLDOWN,
} from "./config/constants";
import { createDagger, applyDaggerLevel, DAGGER_DATA } from "./entities/dagger";
import { createFastSword, FAST_SWORD_DATA } from "./entities/fastSword";
import { createFireWand, FIRE_WAND_DATA } from "./entities/fireWand";
import { createPlayer } from "./entities/player";
import { createUpgradeManager } from "./systems/upgradeManager";
import {
  grantExp,
  initPlayerProgression,
  levelUpState,
  playerStats,
} from "./systems/playerProgression";
import { createWaveManager } from "./systems/waveManager";
import { knockback } from "./utils/combat";
import { createXpBar } from "./ui/xpBar";
import { createWaveHud } from "./ui/waveHud";
import { createHealthBar } from "./ui/healthBar";
import {
  getGamePhase,
  isGameRunning,
  markGameOver,
  pauseGameplay,
  resumeGameplay,
  startGameplay,
  resetToStart,
} from "./systems/gameState";
import { createGameMenus } from "./ui/gameMenus";
import { createAudioManager } from "./systems/audioManager";

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
