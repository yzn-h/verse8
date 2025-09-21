import kaplay from "kaplay";

import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  DAGGER_KNOCKBACK_DIST,
  TOUCH_COOLDOWN,
} from "./config/constants";
import { createDagger, applyDaggerLevel, DAGGER_DATA } from "./entities/dagger";
import { createFastSword, FAST_SWORD_DATA } from "./entities/fastSword";
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

const k = kaplay({
  background: [11, 8, 4],
  width: ARENA_WIDTH,
  height: ARENA_HEIGHT,
  canvas: document.querySelector("canvas") ?? undefined,
});

const player = createPlayer(k);
const dagger = createDagger(k, player);
const fastSword = createFastSword(k, player);

const { updateXpBarUI } = createXpBar(k);
const upgradeManager = createUpgradeManager(k, dagger, fastSword, updateXpBarUI);

const waveManager = createWaveManager(k, player);
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

  initPlayerProgression();
  updateXpBarUI();

  resetToStart();
  runStartTime = 0;

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
  menus?.hidePauseMenu();
};

const startRun = () => {
  if (getGamePhase() === "running") return;
  menus?.hideStartMenu();
  menus?.hidePauseMenu();
  menus?.hideGameOverMenu();
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
    menus?.showPauseMenu();
  }
};

const handleStart = () => {
  if (getGamePhase() !== "start") return;
  startRun();
};

const handleRestart = () => {
  resetRunState({ showStartMenu: false });
  startRun();
};

menus = createGameMenus(k, {
  onStart: handleStart,
  onResume: resumeFromPause,
  onRestart: handleRestart,
});

resetRunState({ showStartMenu: true });

player.on("death", () => {
  waveManager.stopWaves();
  upgradeManager.cancelMenu();
  markGameOver();
  menus?.hidePauseMenu();

  const { waveState, WAVES } = waveManager;
  const totalWaves = WAVES.length;
  let waveNumber = waveState.index + 1;
  if (waveNumber <= 0) waveNumber = 1;
  if (totalWaves > 0) {
    waveNumber = Math.min(waveNumber, totalWaves);
  }
  const survivalSeconds = runStartTime > 0 ? Math.max(0, k.time() - runStartTime) : 0;
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
  enemy.hurt(dagger.data.damage);
  knockback(k, enemy, player.pos, DAGGER_KNOCKBACK_DIST);
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
    enemy.hurt(damage);
  }
  knockback(k, enemy, slash.pos ?? player.pos);
});

k.onCollide("enemy", "player", (enemy: any, p: any) => {
  if (!isGameRunning()) return;
  if (levelUpState.active) return;
  if (enemy.touchTimer > 0) return;
  enemy.touchTimer = TOUCH_COOLDOWN;
  p.hurt(enemy.data.touchDamage);
  knockback(k, p, enemy.pos);
});

k.onCollide("player", "expShard", (_player: any, shard: any) => {
  if (!isGameRunning()) return;
  const value = Math.max(0, Math.round(shard.expValue ?? 0));
  if (value > 0) {
    grantExp(value);
    updateXpBarUI();
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
    player.move(unit.x * player.data.speed * magnitude, unit.y * player.data.speed * magnitude);
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
