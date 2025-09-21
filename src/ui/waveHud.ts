import { playerStats } from "../systems/playerProgression";
import { getActiveEnemyCount } from "../systems/enemyManager";
import type { WaveManager } from "../systems/waveManager";

export const createWaveHud = (k: any, waveManager: WaveManager) => {
  const waveHud = k.add([
    k.text("", { size: 20, align: "left" }),
    k.pos(16, 16),
    k.anchor("topleft"),
    k.color(240, 240, 240),
    "ui",
  ]);

  waveHud.onUpdate(() => {
    const { WAVES, waveState } = waveManager;
    const total = WAVES.length;
    const nextIn =
      waveState.nextWaveAt != null
        ? Math.max(0, waveState.nextWaveAt - k.time())
        : null;

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
    const lines = [
      waveLine,
      status,
      `LVL ${playerStats.level} | Total XP: ${playerStats.totalExp}`,
    ].filter(Boolean);
    waveHud.text = lines.join("\n");
  });

  return waveHud;
};
