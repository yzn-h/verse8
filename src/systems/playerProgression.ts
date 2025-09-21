import {
  DEFAULT_PICKUP_RADIUS,
  LEVEL_XP_BASE,
  LEVEL_XP_GROWTH,
} from "../config/constants";

export const playerStats = {
  level: 1,
  exp: 0,
  totalExp: 0,
  expToNext: 0,
  pickupRadius: DEFAULT_PICKUP_RADIUS,
};

export const levelUpState = {
  pending: 0,
  active: false,
};

let levelUpQueueListener: (() => void) | null = null;

export const onLevelUpQueued = (listener: () => void) => {
  levelUpQueueListener = listener;
};

export const expRequiredForLevel = (level: number) =>
  Math.max(1, Math.round(LEVEL_XP_BASE + (level - 1) * LEVEL_XP_GROWTH));

export const initPlayerProgression = () => {
  playerStats.exp = 0;
  playerStats.totalExp = 0;
  playerStats.level = 1;
  playerStats.expToNext = expRequiredForLevel(playerStats.level);
  playerStats.pickupRadius = DEFAULT_PICKUP_RADIUS;
  levelUpState.pending = 0;
  levelUpState.active = false;
};

export const grantExp = (amount: number) => {
  if (amount <= 0) return;
  playerStats.totalExp += amount;
  playerStats.exp += amount;

  while (playerStats.expToNext > 0 && playerStats.exp >= playerStats.expToNext) {
    playerStats.exp -= playerStats.expToNext;
    playerStats.level += 1;
    playerStats.expToNext = expRequiredForLevel(playerStats.level);
    queueLevelUp();
  }
};

export const queueLevelUp = () => {
  levelUpState.pending += 1;
  levelUpQueueListener?.();
};

export const setLevelUpActive = (value: boolean) => {
  levelUpState.active = value;
};

export const consumePendingLevelUp = () => {
  if (levelUpState.pending <= 0) {
    return false;
  }
  levelUpState.pending -= 1;
  return true;
};
