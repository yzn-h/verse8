import { PALETTE } from "../config/palette";

const readHP = (o: any) => (typeof o.hp === "function" ? o.hp() : o.hp);
const readMax = (o: any) => {
  if (o?.data?.maxHP != null) return o.data.maxHP;
  const value = typeof o.maxHP === "function" ? o.maxHP() : o.maxHP;
  return value ?? 0;
};

export const attachHealthLabel = (k: any, target: any, yOffset = -28) => {
  const label = k.add([
    k.text("", { size: 12 }),
    k.pos(target.pos.x, target.pos.y + yOffset),
    k.color(...PALETTE.text),
    k.anchor("center"),
    { yOffset },
  ]);

  const refresh = () => {
    label.text = `${readHP(target)}/${readMax(target)}`;
  };

  target.onUpdate(() => {
    label.pos = target.pos.add(0, label.yOffset);
  });
  target.on("hurt", refresh);
  target.on("heal", refresh);
  target.on("death", () => k.destroy(label));
  refresh();
};
