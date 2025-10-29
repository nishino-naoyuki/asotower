export function init() {
  return {
    job: "summoner",
    name: "野村",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 6,
      y: -5
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

export function update(state, api) {
  const { self, memory } = state;
  const { actions, utils } = api;

  if (!memory.deployed) {
    memory.deployed = true;
    return actions.useSkill();
  }

  if (self.position.x > 28) return actions.moveToward(28, self.position.y);

  const castle = state.enemyCastle;
  if (castle?.position) {
    const dist = utils.distance(self.position, castle.position);
    const range = self.stats.range / 10;
    if (dist <= range) {
      return actions.attackCastle();
    }
    return actions.moveToward(castle.position.x, castle.position.y);
  }

  return actions.moveToward(self.position.x, self.position.y);
}