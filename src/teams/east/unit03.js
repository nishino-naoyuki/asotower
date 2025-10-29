export function init() {
  return {
    job: "archer",
    name: "柳町",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 3,
      y: -2
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) {
    const castle = state.enemyCastle;
    if (castle?.position) {
      const dist = utils.distance(self.position, castle.position);
      const range = self.stats.range / 10;
      if (dist <= range) {
        return actions.attackCastle();
      }
      return actions.moveToward(castle.position.x, castle.position.y);
    }
    return actions.moveToward(22, 5);
  }

  if (utils.inRange(self, target)) {
    state.memory.focusId = target.id;
    return actions.attack(target);
  }

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}