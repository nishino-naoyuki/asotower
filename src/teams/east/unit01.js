export function init() {
  return {
    job: "assassin",
    name: "柳田",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 13,
      y: 1
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const closest = utils.findClosest(enemies, self.position);
  if (!closest) {
    const castle = state.enemyCastle;
    if (castle?.position) {
      const dist = utils.distance(self.position, castle.position);
      const range = self.stats.range / 10;
      if (dist <= range) {
        return actions.attackCastle();
      }
      return actions.moveToward(castle.position.x, castle.position.y);
    }
    return actions.moveToward(22, 6);
  }
  if (utils.inRange(self, closest)) return actions.attack(closest);

  const step = utils.stepToward(self.position, closest.position);
  return actions.moveToward(step.x, step.y);
}