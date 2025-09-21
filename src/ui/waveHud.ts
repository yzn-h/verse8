import { PALETTE } from "../config/palette";
import { playerStats } from "../systems/playerProgression";
import { getActiveEnemyCount } from "../systems/enemyManager";
import { getGamePhase } from "../systems/gameState";
import type { WaveManager } from "../systems/waveManager";

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
