import type { UpgradeOption } from "../config/types";
import {
  consumePendingLevelUp,
  levelUpState,
  onLevelUpQueued,
  playerStats,
  setLevelUpActive,
} from "./playerProgression";

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

const buildUpgradePool = (player: any, dagger: any): UpgradeOption[] => [
  {
    id: "dagger-damage",
    name: "Sharper Blades",
    description: "+1 dagger damage",
    apply: () => {
      dagger.data.damage += 1;
    },
  },
  {
    id: "dagger-speed",
    name: "Whirling Blades",
    description: "+60°/s dagger spin",
    apply: () => {
      dagger.data.rotSpeed += 60;
    },
  },
  {
    id: "dagger-distance",
    name: "Extended Chain",
    description: "+14 dagger radius",
    apply: () => {
      dagger.data.distance += 14;
    },
  },
  {
    id: "player-speed",
    name: "Boots of Swiftness",
    description: "+40 move speed",
    apply: () => {
      player.data.speed += 40;
    },
  },
  {
    id: "pickup-radius",
    name: "Vacuum Core",
    description: "+48 pickup radius",
    apply: () => {
      playerStats.pickupRadius += 48;
    },
  },
  {
    id: "recovery",
    name: "Quick Recovery",
    description: "Restore 2 HP",
    apply: () => {
      if (typeof player.heal === "function") {
        player.heal(2);
      }
    },
  },
];

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
  player: any,
  dagger: any,
  refreshXpBar: () => void
) => {
  const upgradePool = buildUpgradePool(player, dagger);

  const showLevelUpMenu = (options: UpgradeOption[]) => {
    cleanupLevelUpMenu(k);
    if (options.length === 0) {
      finishLevelUpChoice();
      return;
    }

    const panelWidth = 520;
    const panelHeight = 240;
    const center = k.center();

    levelUpMenuState.panel = k.add([
      k.rect(panelWidth, panelHeight),
      k.pos(center.x, center.y),
      k.anchor("center"),
      k.color(20, 20, 20),
      k.outline(2, k.rgb(220, 220, 220)),
      k.fixed(),
      "ui",
    ]);

    const textLines = ["LEVEL UP!", ""];
    options.forEach((opt, idx) => {
      textLines.push(`${idx + 1}. ${opt.name} - ${opt.description}`);
    });
    textLines.push("", `Press 1-${options.length} to choose`);

    levelUpMenuState.text = k.add([
      k.text(textLines.join("\n"), {
        size: 20,
        align: "left",
        width: panelWidth - 32,
        lineSpacing: 6,
      }),
      k.pos(center.x - panelWidth / 2 + 16, center.y - panelHeight / 2 + 16),
      k.anchor("topleft"),
      k.color(240, 240, 240),
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
    const options = pickUpgradeOptions(upgradePool, 3);
    levelUpMenuState.options = options;
    showLevelUpMenu(options);
  }

  function finishLevelUpChoice() {
    setLevelUpActive(false);
    cleanupLevelUpMenu(k);
    if (levelUpState.pending > 0) {
      startLevelUpChoice();
    }
  }

  function applyUpgradeOption(option: UpgradeOption) {
    option.apply();
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
    cancelMenu: () => cleanupLevelUpMenu(k),
  };
};
