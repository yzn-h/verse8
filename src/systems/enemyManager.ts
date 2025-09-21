const enemiesAlive = new Set<any>();
let activeEnemyCount = 0;

export const registerEnemy = (enemy: any) => {
  activeEnemyCount += 1;
  enemiesAlive.add(enemy);

  const cleanup = () => {
    if (enemiesAlive.delete(enemy)) {
      activeEnemyCount = Math.max(0, activeEnemyCount - 1);
    }
  };

  enemy.on("death", cleanup);
  enemy.on("destroy", cleanup);
};

export const getActiveEnemyCount = () => activeEnemyCount;
