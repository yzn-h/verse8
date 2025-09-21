import { PLAYER_MAX_HP } from "../config/constants";
import { PALETTE } from "../config/palette";
import { lighten } from "../utils/color";

const healthBarRefs: { background: any; fill: any } = {
  background: null,
  fill: null,
};

export const createHealthBar = (k: any, target: any) => {
  const barWidth = 100;
  const barHeight = 16;
  const yOffset = -60;

  // Background bar (empty health)
  healthBarRefs.background = k.add([
    k.rect(barWidth + 4, barHeight + 4),
    k.pos(target.pos.x - barWidth/2 - 2, target.pos.y + yOffset - 2),
    k.color(...PALETTE.secondary),
    k.outline(2, k.rgb(...lighten(PALETTE.secondary, 0.35))),
    k.anchor("center"),
    "healthBar",
    "ui",
  ]);

  // Fill bar (current health)
  healthBarRefs.fill = k.add([
    k.rect(barWidth, barHeight),
    k.pos(target.pos.x - barWidth/2, target.pos.y + yOffset),
    k.color(...PALETTE.primary),
    k.anchor("center"),
    "healthBar",
    "ui",
    { baseWidth: barWidth },
  ]);

  const updateHealthBar = () => {
    const fill = healthBarRefs.fill;
    if (fill) {
      const currentHP = typeof target.hp === "function" ? target.hp() : target.hp;
      const maxHP = PLAYER_MAX_HP;
      const ratio = maxHP > 0 ? currentHP / maxHP : 0;
      const clamped = Math.min(1, Math.max(0, ratio));
      const baseWidth = fill.baseWidth ?? fill.width ?? 0;

      if (typeof fill.width === "number") {
        fill.width = baseWidth * clamped;
      } else if (fill.scale) {
        fill.scale.x = clamped;
      }
    }
  };

  const updatePosition = () => {
    const background = healthBarRefs.background;
    const fill = healthBarRefs.fill;
    if (background && fill) {
      background.pos = target.pos.add(0, yOffset);
      fill.pos = target.pos.add(0, yOffset);
      debugLabel.pos = target.pos.add(0, yOffset - 25);
    }
  };

  // Debug: Add a simple text label to see if the health bar is being created
  const debugLabel = k.add([
    k.text("HP", { size: 10 }),
    k.pos(target.pos.x, target.pos.y + yOffset - 25),
    k.color(...PALETTE.text),
    k.anchor("center"),
    "healthBar",
    "ui",
  ]);

  target.onUpdate(updatePosition);
  target.on("hurt", updateHealthBar);
  target.on("heal", updateHealthBar);
  target.on("death", () => {
    k.destroy(healthBarRefs.background);
    k.destroy(healthBarRefs.fill);
    k.destroy(debugLabel);
  });
  target.on("destroy", () => {
    k.destroy(healthBarRefs.background);
    k.destroy(healthBarRefs.fill);
    k.destroy(debugLabel);
  });

  updateHealthBar();
  updatePosition();

  return { updateHealthBar };
};