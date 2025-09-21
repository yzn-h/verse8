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
