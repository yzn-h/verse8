import kaplay from "kaplay";
const k = kaplay({
  background: [0, 0, 0],
  width: 800,
  height: 600,
  canvas: document.querySelector("canvas") ?? undefined,
});
// === Tunables ===
const PLAYER_SPEED = 320;
const DAGGER_ROT_SPEED = 200;
const DAGGER_DAMAGE = 1;
const ENEMY_SPEED = 90;
const ENEMY_TOUCH_DAMAGE = 1;
const KNOCKBACK_DIST = 36;
const KNOCKBACK_TIME = 0.12;
const TOUCH_COOLDOWN = 0.4;

// === Entity data shapes ===
type PlayerData = {
  kind: "player";
  speed: number;
  maxHP: number;
};
type EnemyData = {
  kind: "enemy";
  speed: number;
  touchDamage: number;
  maxHP: number;
};
type DaggerData = {
  kind: "dagger";
  damage: number;
  rotSpeed: number;
  distance: number;
};

// === Default data ===
const PLAYER_DATA: PlayerData = {
  kind: "player",
  speed: PLAYER_SPEED,
  maxHP: 5,
};
const ENEMY_BASE = {
  kind: "enemy",
  speed: ENEMY_SPEED,
  touchDamage: ENEMY_TOUCH_DAMAGE,
} as const;
const DAGGER_DATA: DaggerData = {
  kind: "dagger",
  damage: DAGGER_DAMAGE,
  rotSpeed: DAGGER_ROT_SPEED,
  distance: 40,
};

// === Utils ===
const unit = (v: any) => (v.len() > 0 ? v.unit() : k.vec2(0.0, 0));
const readHP = (o: any) => (typeof o.hp === "function" ? o.hp() : o.hp);
const readMax = (o: any) => {
  if (o?.data?.maxHP != null) return o.data.maxHP;
  const m = typeof o.maxHP === "function" ? o.maxHP() : o.maxHP;
  if (m != null) return m;
  // As a last resort, keep it explicit rather than silently wrong.
  // You can return 0 if you prefer, but don't use current HP.
  return 0;
};

function attachHealthLabel(target: any, yOffset = -28) {
  const label = k.add([
    k.text("", { size: 12 }),
    k.pos(target.pos.x, target.pos.y + yOffset),
    k.color(255, 255, 255),
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
}

function knockback(obj: any, fromPos: any, dist = KNOCKBACK_DIST) {
  const dir = unit(obj.pos.sub(fromPos));
  const to = obj.pos.add(dir.scale(dist));
  if (obj._kbTween && obj._kbTween.cancel) obj._kbTween.cancel();
  obj._kbTween = k.tween(
    obj.pos,
    to,
    KNOCKBACK_TIME,
    (p) => (obj.pos = p),
    k.easings.easeOutCubic
  );
}

// === Player ===
const player = k.add([
  k.pos(k.center()),
  k.rect(32, 32),
  k.color(255, 255, 255),
  k.anchor("center"),
  k.area(),
  k.health(PLAYER_DATA.maxHP),
  "player",
  { data: { ...PLAYER_DATA }, _kbTween: null as any },
]);
attachHealthLabel(player);

// === Dagger ===
const dagger = k.add([
  k.pos(player.pos),
  k.rect(24, 8),
  k.color(255, 0, 0),
  k.anchor("center"),
  k.rotate(0),
  k.area(),
  "dagger",
  { data: { ...DAGGER_DATA } },
]);

dagger.onUpdate(() => {
  dagger.angle += dagger.data.rotSpeed * k.dt();
  const offset = k.Vec2.fromAngle(dagger.angle).scale(dagger.data.distance);
  dagger.pos = player.pos.add(offset);
});

// === Enemies ===
function makeEnemy(p: any, hp = 4) {
  const e = k.add([
    k.pos(p),
    k.rect(28, 28),
    k.color(50, 180, 255),
    k.anchor("center"),
    k.area(),
    k.body(),
    k.health(hp),
    "enemy",
    {
      touchTimer: 0,
      _kbTween: null as any,
      data: { ...(ENEMY_BASE as Omit<EnemyData, "maxHP">), maxHP: hp },
    },
  ]);

  attachHealthLabel(e, -24);

  e.onUpdate(() => {
    const dir = unit(player.pos.sub(e.pos));
    e.move(dir.x * e.data.speed, dir.y * e.data.speed);
    if (e.touchTimer > 0) e.touchTimer -= k.dt();
  });

  return e;
}

makeEnemy(k.vec2(150, 120), 3);
makeEnemy(k.vec2(650, 480), 6);
makeEnemy(k.vec2(400, 80), 4);

// === Combat (now uses data on objects) ===
k.onCollide("dagger", "enemy", (_d: any, enemy: any) => {
  enemy.hurt(dagger.data.damage);
  knockback(enemy, player.pos);
});

k.onCollide("enemy", "player", (enemy: any, p: any) => {
  if (enemy.touchTimer > 0) return;
  enemy.touchTimer = TOUCH_COOLDOWN;
  p.hurt(enemy.data.touchDamage);
  knockback(p, enemy.pos);
});

// auto-clean enemy on death
k.on("death", "enemy", (enemy: any) => k.destroy(enemy));

// === Movement (reads player speed from data) ===
const moveBy = (dx = 0, dy = 0) =>
  player.move(dx * player.data.speed, dy * player.data.speed);
k.onKeyDown("w", () => moveBy(0, -1));
k.onKeyDown("s", () => moveBy(0, 1));
k.onKeyDown("a", () => moveBy(-1, 0));
k.onKeyDown("d", () => moveBy(1, 0));
k.onKeyDown("up", () => moveBy(0, -1));
k.onKeyDown("down", () => moveBy(0, 1));
k.onKeyDown("left", () => moveBy(-1, 0));
k.onKeyDown("right", () => moveBy(1, 0));
k.onGamepadStick("left", (v) => moveBy(v.x, v.y));
