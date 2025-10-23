export function init() {
  return {
    job: "guardian",
    initialPosition: { x: 10, y: 9 },
    memory: { burstTurn: -1 }
  };
}

export function update(state, api) {
  const { self, enemies, turn } = state;
  const { actions, utils } = api;

  let weakest = null;
  let minHp = Infinity;
  for (const enemy of enemies) {
    if (enemy.hp < minHp) {
      minHp = enemy.hp;
      weakest = enemy;
    }
  }

  if (!weakest) {
    const castle = state.enemyCastle;
    if (castle?.position) {
      const dist = utils.distance(self.position, castle.position);
      const range = self.stats.range / 10;
      if (dist <= range) {
        return actions.attackCastle();
      }
      return actions.moveToward(castle.position.x, castle.position.y);
    }
    return actions.moveToward(17, 9);
  }
  if (!self.skill.used && turn >= 3) return actions.useSkill(weakest);
  if (utils.inRange(self, weakest)) return actions.attack(weakest);

  const step = utils.stepToward(self.position, weakest.position);
  return actions.moveToward(step.x, step.y);
}