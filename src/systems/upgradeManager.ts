import { PALETTE } from "../config/palette";
import type { UpgradeOption } from "../config/types";
import {
  applyDaggerDefinition,
  getNextDaggerLevel,
  DAGGER_LEVELS,
} from "../entities/dagger";
import {
  applyFastSwordDefinition,
  getNextFastSwordLevel,
} from "../entities/fastSword";
import { lighten } from "../utils/color";
import {
  consumePendingLevelUp,
  levelUpState,
  onLevelUpQueued,
  setLevelUpActive,
} from "./playerProgression";

type UpgradeManagerHooks = {
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onUpgradeApplied?: () => void;
};

const levelUpMenuState: {
  panel: any;
  text: any;
  keyHandlers: any[];
  options: UpgradeOption[];
} = {
  panel: null,
  text: null,
  keyHandlers: [],
  options: [],
};

const formatStatDelta = (
  label: string,
  value: number,
  unit = ""
): string | null => {
  if (value === 0) return null;
  const prefix = value > 0 ? "+" : "";
  if (unit) {
    return `${prefix}${value}${unit} ${label}`;
  }
  return `${prefix}${value} ${label}`;
};

const buildDaggerUpgradeOption = (dagger: any): UpgradeOption | null => {
  const currentLevel = dagger.data.level ?? 1;
  const nextDef = getNextDaggerLevel(currentLevel);
  if (!nextDef) return null;

  const prevDef =
    DAGGER_LEVELS.find((def) => def.level === currentLevel) ?? DAGGER_LEVELS[0];
  const countDelta = nextDef.count - prevDef.count;
  const damageDelta = nextDef.damage - prevDef.damage;
  const speedDelta = nextDef.rotSpeed - prevDef.rotSpeed;
  const distanceDelta = nextDef.distance - prevDef.distance;

  const deltas = [
    formatStatDelta(
      `dagger${Math.abs(countDelta) === 1 ? "" : "s"}`,
      countDelta
    ),
    formatStatDelta("damage", damageDelta),
    formatStatDelta("spin", speedDelta, "°/s"),
    formatStatDelta("radius", distanceDelta),
  ].filter(Boolean);

  const statsText = deltas.length > 0 ? ` (${deltas.join(", ")})` : "";

  return {
    id: `dagger-level-${nextDef.level}`,
    name: `${nextDef.name} (Lv.${nextDef.level})`,
    description: `${nextDef.description}${statsText}`,
    apply: () => {
      applyDaggerDefinition(dagger, nextDef);
    },
  };
};

const buildFastSwordUpgradeOption = (sword: any): UpgradeOption | null => {
  const currentLevel = sword.data.level ?? 0;
  const nextDef = getNextFastSwordLevel(currentLevel);
  if (!nextDef) return null;

  return {
    id: `fast-sword-level-${nextDef.level}`,
    name: `${nextDef.name} (Lv.${nextDef.level})`,
    description: nextDef.description,
    apply: () => {
      applyFastSwordDefinition(sword, nextDef);
    },
  };
};

const buildUpgradePool = (dagger: any, sword: any): UpgradeOption[] => {
  const pool: UpgradeOption[] = [];

  const daggerUpgrade = buildDaggerUpgradeOption(dagger);
  if (daggerUpgrade) {
    pool.push(daggerUpgrade);
  }

  const swordUpgrade = buildFastSwordUpgradeOption(sword);
  if (swordUpgrade) {
    pool.push(swordUpgrade);
  }

  return pool;
};

const pickUpgradeOptions = (
  pool: UpgradeOption[],
  count: number
): UpgradeOption[] => {
  const available = [...pool];
  for (let i = available.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available.slice(0, Math.min(count, available.length));
};

const cleanupLevelUpMenu = (k: any) => {
  levelUpMenuState.keyHandlers.forEach((handler) => handler.cancel?.());
  levelUpMenuState.keyHandlers = [];
  if (levelUpMenuState.text) {
    k.destroy(levelUpMenuState.text);
    levelUpMenuState.text = null;
  }
  if (levelUpMenuState.panel) {
    k.destroy(levelUpMenuState.panel);
    levelUpMenuState.panel = null;
  }
  levelUpMenuState.options = [];
};

export const createUpgradeManager = (
  k: any,
  dagger: any,
  fastSword: any,
  refreshXpBar: () => void,
  hooks: UpgradeManagerHooks = {}
) => {
  const showLevelUpMenu = (options: UpgradeOption[]) => {
    cleanupLevelUpMenu(k);
    if (options.length === 0) {
      finishLevelUpChoice();
      return;
    }

    hooks.onMenuOpen?.();

    const panelWidth = 520;
    const panelHeight = 240;
    const center = k.center();

    levelUpMenuState.panel = k.add([
      k.rect(panelWidth, panelHeight),
      k.pos(center.x, center.y),
      k.anchor("center"),
      k.color(...PALETTE.secondary),
      k.outline(2, k.rgb(...lighten(PALETTE.secondary, 0.4))),
      k.fixed(),
      "ui",
    ]);

    const textLines = ["LEVEL UP!", ""];
    options.forEach((opt, idx) => {
      textLines.push(`${idx + 1}. ${opt.name} - ${opt.description}`);
    });
    if (options.length === 1) {
      textLines.push("", "Press 1 to choose");
    } else {
      textLines.push("", `Press 1-${options.length} to choose`);
    }

    levelUpMenuState.text = k.add([
      k.text(textLines.join("\n"), {
        size: 20,
        align: "left",
        width: panelWidth - 32,
        lineSpacing: 6,
      }),
      k.pos(center.x - panelWidth / 2 + 16, center.y - panelHeight / 2 + 16),
      k.anchor("topleft"),
      k.color(...PALETTE.text),
      k.fixed(),
      "ui",
    ]);

    options.forEach((opt, idx) => {
      const key = `${idx + 1}`;
      const handler = k.onKeyPress(key, () => applyUpgradeOption(opt));
      levelUpMenuState.keyHandlers.push(handler);
    });
  };

  function startLevelUpChoice() {
    if (!consumePendingLevelUp()) return;

    setLevelUpActive(true);
    const pool = buildUpgradePool(dagger, fastSword);
    const options = pickUpgradeOptions(pool, 3);
    levelUpMenuState.options = options;
    showLevelUpMenu(options);
  }

  function finishLevelUpChoice() {
    const wasVisible = Boolean(levelUpMenuState.panel || levelUpMenuState.text);
    setLevelUpActive(false);
    cleanupLevelUpMenu(k);
    if (wasVisible) {
      hooks.onMenuClose?.();
    }
    if (levelUpState.pending > 0) {
      startLevelUpChoice();
    }
  }

  function applyUpgradeOption(option: UpgradeOption) {
    option.apply();
    hooks.onUpgradeApplied?.();
    refreshXpBar();
    finishLevelUpChoice();
  }

  const handleLevelUpQueued = () => {
    if (!levelUpState.active) {
      startLevelUpChoice();
    }
  };

  onLevelUpQueued(handleLevelUpQueued);

  return {
    startLevelUpChoice,
    finishLevelUpChoice,
    cancelMenu: () => {
      const wasVisible = Boolean(levelUpMenuState.panel || levelUpMenuState.text);
      cleanupLevelUpMenu(k);
      if (wasVisible) {
        hooks.onMenuClose?.();
      }
    },
  };
};
