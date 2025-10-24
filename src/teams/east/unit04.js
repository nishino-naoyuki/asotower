export function init() {
  return {
    job: "healer",
    name: "East Unit 04",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 1,
      y: 3
    },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies, turn } = state;
  const { actions, utils } = api;

  let weakest = null;
  for (const enemy of enemies) {
    if (!weakest || enemy.hp < weakest.hp) weakest = enemy;
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
    return actions.moveToward(23, 10);
  }
  if (!self.skill.used && turn >= 3) return actions.useSkill(weakest);
  if (utils.inRange(self, weakest)) return actions.attack(weakest);

  const step = utils.stepToward(self.position, weakest.position);
  return actions.moveToward(step.x, step.y);
}