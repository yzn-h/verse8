import {
  XP_BAR_BOTTOM_OFFSET,
  XP_BAR_HEIGHT,
  XP_BAR_MARGIN,
  XP_BAR_WIDTH,
} from "../config/constants";
import { playerStats } from "../systems/playerProgression";

const xpUiRefs: { fill: any; label: any } = {
  fill: null,
  label: null,
};

export const createXpBar = (k: any) => {
  k.add([
    k.rect(XP_BAR_WIDTH + 4, XP_BAR_HEIGHT + 4),
    k.pos(
      XP_BAR_MARGIN - 2,
      k.height() - XP_BAR_BOTTOM_OFFSET - XP_BAR_HEIGHT - 2
    ),
    k.color(30, 30, 30),
    k.anchor("topleft"),
    k.fixed(),
    "ui",
  ]);

  xpUiRefs.fill = k.add([
    k.rect(XP_BAR_WIDTH, XP_BAR_HEIGHT),
    k.pos(XP_BAR_MARGIN, k.height() - XP_BAR_BOTTOM_OFFSET - XP_BAR_HEIGHT),
    k.color(90, 180, 255),
    k.anchor("topleft"),
    k.fixed(),
    "ui",
    { baseWidth: XP_BAR_WIDTH },
  ]);

  xpUiRefs.label = k.add([
    k.text("", { size: 16, align: "left" }),
    k.pos(
      XP_BAR_MARGIN,
      k.height() - XP_BAR_BOTTOM_OFFSET - XP_BAR_HEIGHT - 18
    ),
    k.color(220, 220, 220),
    k.anchor("topleft"),
    k.fixed(),
    "ui",
  ]);

  const updateXpBarUI = () => {
    const fill = xpUiRefs.fill;
    if (fill) {
      const ratio = playerStats.expToNext > 0 ? playerStats.exp / playerStats.expToNext : 0;
      const clamped = Math.min(1, Math.max(0, ratio));
      const baseWidth = fill.baseWidth ?? fill.width ?? 0;
      if (typeof fill.width === "number") {
        fill.width = baseWidth * clamped;
      } else if (fill.scale) {
        fill.scale.x = clamped;
      }
    }

    const label = xpUiRefs.label;
    if (label) {
      label.text = `Level ${playerStats.level} - ${Math.round(playerStats.exp)}/${playerStats.expToNext}`;
    }
  };

  updateXpBarUI();
  return { updateXpBarUI };
};
