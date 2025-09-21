import kaplay from "kaplay";

import { ARENA_HEIGHT, ARENA_WIDTH, TOUCH_COOLDOWN } from "./config/constants";
import { createDagger } from "./entities/dagger";
import { createPlayer } from "./entities/player";
import { createUpgradeManager } from "./systems/upgradeManager";
import {
  grantExp,
  initPlayerProgression,
  levelUpState,
} from "./systems/playerProgression";
import { createWaveManager } from "./systems/waveManager";
import { knockback } from "./utils/combat";
import { createXpBar } from "./ui/xpBar";
import { createWaveHud } from "./ui/waveHud";

const k = kaplay({
  background: [0, 0, 0],
  width: ARENA_WIDTH,
  height: ARENA_HEIGHT,
  canvas: document.querySelector("canvas") ?? undefined,
});
initPlayerProgression();

const player = createPlayer(k);
const dagger = createDagger(k, player);

const { updateXpBarUI } = createXpBar(k);
createUpgradeManager(k, player, dagger, updateXpBarUI);

const waveManager = createWaveManager(k, player);
createWaveHud(k, waveManager);

waveManager
  .runWaveSequence()
  .catch((err) => console.error("Wave sequence halted", err));

player.on("death", () => {
  waveManager.stopWaves();
});

// === Combat ===
k.onCollide("dagger", "enemy", (_d: any, enemy: any) => {
  enemy.hurt(dagger.data.damage);
  knockback(k, enemy, player.pos);
});

k.onCollide("enemy", "player", (enemy: any, p: any) => {
  if (levelUpState.active) return;
  if (enemy.touchTimer > 0) return;
  enemy.touchTimer = TOUCH_COOLDOWN;
  p.hurt(enemy.data.touchDamage);
  knockback(k, p, enemy.pos);
});

k.onCollide("player", "expShard", (_player: any, shard: any) => {
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
  if (levelUpState.active) return;
  player.move(dx * player.data.speed, dy * player.data.speed);
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
