import { PALETTE } from "../config/palette";

type MenuHandlers = Array<{ cancel?: () => void }>;

type MenuActors = any[];

type MenuCallbacks = {
  onStart?: () => void;
  onResume?: () => void;
  onRestart?: () => void;
};

type GameOverInfo = {
  headline?: string;
  details?: string[];
};

const destroyActors = (k: any, actors: MenuActors) => {
  while (actors.length > 0) {
    const actor = actors.pop();
    if (actor) {
      k.destroy(actor);
    }
  }
};

const cancelHandlers = (handlers: MenuHandlers) => {
  while (handlers.length > 0) {
    const handler = handlers.pop();
    handler?.cancel?.();
  }
};

const registerHandler = (handlers: MenuHandlers, handler: any) => {
  if (handler && typeof handler.cancel === "function") {
    handlers.push(handler);
  }
};

export const createGameMenus = (k: any, callbacks: MenuCallbacks) => {
  const state = {
    startActors: [] as MenuActors,
    pauseActors: [] as MenuActors,
    gameOverActors: [] as MenuActors,
    startHandlers: [] as MenuHandlers,
    pauseHandlers: [] as MenuHandlers,
    gameOverHandlers: [] as MenuHandlers,
  };

  const center = () => k.center();
  const overlayColor = k.rgb(0, 0, 0);

  const showStartMenu = () => {
    if (state.startActors.length > 0) return;

    const { x, y } = center();
    const overlay = k.add([
      k.rect(k.width(), k.height()),
      k.pos(x, y),
      k.anchor("center"),
      k.color(overlayColor),
      k.opacity(0.82),
      k.fixed(),
      "ui",
    ]);

    const title = k.add([
      k.text("VERSE 8", {
        size: 48,
        align: "center",
        width: Math.max(320, k.width() - 160),
      }),
      k.pos(x, y - 120),
      k.anchor("center"),
      k.color(...PALETTE.accent),
      k.fixed(),
      "ui",
    ]);

    const instructions = [
      "Press Enter / Space / Click to begin",
      "WASD or Arrow Keys to move",
      "Defeat enemies to gain experience",
      "Press ESC to pause",
    ];

    const body = k.add([
      k.text(instructions.join("\n"), {
        size: 22,
        align: "center",
        width: Math.max(360, k.width() - 200),
        lineSpacing: 8,
      }),
      k.pos(x, y + 24),
      k.anchor("center"),
      k.color(...PALETTE.text),
      k.fixed(),
      "ui",
    ]);

    state.startActors.push(overlay, title, body);

    const triggerStart = () => {
      callbacks.onStart?.();
    };

    registerHandler(state.startHandlers, k.onKeyPress("enter", triggerStart));
    registerHandler(state.startHandlers, k.onKeyPress("space", triggerStart));
    registerHandler(state.startHandlers, k.onMousePress(triggerStart));
    registerHandler(
      state.startHandlers,
      k.onGamepadButtonPress?.("start", triggerStart)
    );
    registerHandler(
      state.startHandlers,
      k.onGamepadButtonPress?.("south", triggerStart)
    );
  };

  const hideStartMenu = () => {
    destroyActors(k, state.startActors);
    cancelHandlers(state.startHandlers);
  };

  const showPauseMenu = () => {
    if (state.pauseActors.length > 0) return;

    const { x, y } = center();
    const overlay = k.add([
      k.rect(k.width(), k.height()),
      k.pos(x, y),
      k.anchor("center"),
      k.color(overlayColor),
      k.opacity(0.7),
      k.fixed(),
      "ui",
    ]);

    const boxWidth = Math.min(k.width() - 120, 480);
    const panel = k.add([
      k.rect(boxWidth, 220),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...PALETTE.secondary),
      k.outline(3, k.rgb(...PALETTE.primary)),
      k.fixed(),
      "ui",
    ]);

    const lines = [
      "Paused",
      "",
      "Press Enter or Space to resume",
      "Press ESC to close the menu",
    ];

    const text = k.add([
      k.text(lines.join("\n"), {
        size: 24,
        align: "center",
        width: boxWidth - 48,
        lineSpacing: 10,
      }),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...PALETTE.text),
      k.fixed(),
      "ui",
    ]);

    state.pauseActors.push(overlay, panel, text);

    const triggerResume = () => {
      callbacks.onResume?.();
    };

    registerHandler(state.pauseHandlers, k.onKeyPress("enter", triggerResume));
    registerHandler(state.pauseHandlers, k.onKeyPress("space", triggerResume));
    registerHandler(state.pauseHandlers, k.onKeyPress("p", triggerResume));
    registerHandler(state.pauseHandlers, k.onMousePress(triggerResume));
    registerHandler(
      state.pauseHandlers,
      k.onGamepadButtonPress?.("start", triggerResume)
    );
    registerHandler(
      state.pauseHandlers,
      k.onGamepadButtonPress?.("south", triggerResume)
    );
  };

  const hidePauseMenu = () => {
    destroyActors(k, state.pauseActors);
    cancelHandlers(state.pauseHandlers);
  };

  const showGameOverMenu = (info?: GameOverInfo) => {
    if (state.gameOverActors.length > 0) return;

    const { x, y } = center();
    const overlay = k.add([
      k.rect(k.width(), k.height()),
      k.pos(x, y),
      k.anchor("center"),
      k.color(overlayColor),
      k.opacity(0.88),
      k.fixed(),
      "ui",
    ]);

    const boxWidth = Math.min(k.width() - 120, 520);
    const panel = k.add([
      k.rect(boxWidth, 260),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...PALETTE.secondary),
      k.outline(3, k.rgb(...PALETTE.accent)),
      k.fixed(),
      "ui",
    ]);

    const lines: string[] = [];
    lines.push(info?.headline ?? "Defeat");
    lines.push("");
    if (info?.details?.length) {
      lines.push(...info.details);
      lines.push("");
    }
    lines.push("Press Enter / Space / R to restart");

    const text = k.add([
      k.text(lines.join("\n"), {
        size: 24,
        align: "center",
        width: boxWidth - 56,
        lineSpacing: 10,
      }),
      k.pos(x, y),
      k.anchor("center"),
      k.color(...PALETTE.text),
      k.fixed(),
      "ui",
    ]);

    state.gameOverActors.push(overlay, panel, text);

    const triggerRestart = () => {
      callbacks.onRestart?.();
    };

    registerHandler(state.gameOverHandlers, k.onKeyPress("enter", triggerRestart));
    registerHandler(state.gameOverHandlers, k.onKeyPress("space", triggerRestart));
    registerHandler(state.gameOverHandlers, k.onKeyPress("r", triggerRestart));
    registerHandler(state.gameOverHandlers, k.onMousePress(triggerRestart));
    registerHandler(
      state.gameOverHandlers,
      k.onGamepadButtonPress?.("start", triggerRestart)
    );
    registerHandler(
      state.gameOverHandlers,
      k.onGamepadButtonPress?.("south", triggerRestart)
    );
  };

  const hideGameOverMenu = () => {
    destroyActors(k, state.gameOverActors);
    cancelHandlers(state.gameOverHandlers);
  };

  return {
    showStartMenu,
    hideStartMenu,
    showPauseMenu,
    hidePauseMenu,
    showGameOverMenu,
    hideGameOverMenu,
  };
};
