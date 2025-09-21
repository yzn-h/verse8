import { KNOCKBACK_DIST, KNOCKBACK_TIME } from "../config/constants";
import { unitVec } from "../utils/vector";

export const knockback = (
  k: any,
  obj: any,
  fromPos: any,
  dist = KNOCKBACK_DIST
) => {
  const dir = unitVec(k, obj.pos.sub(fromPos));
  const to = obj.pos.add(dir.scale(dist));
  if (obj._kbTween && obj._kbTween.cancel) obj._kbTween.cancel();
  obj._kbTween = k.tween(
    obj.pos,
    to,
    KNOCKBACK_TIME,
    (p: any) => (obj.pos = p),
    k.easings.easeOutCubic
  );
};
