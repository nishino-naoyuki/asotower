export function init() {
  return {
    job: "engineer",
    name: "小幡",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 2,
      y: 2
    },
    memory: { deployed: false }
  };
}

export function update(state, api) {
  const { self, memory } = state;
  const { actions, utils } = api;

  if (!memory.deployed) {
    memory.deployed = true;
    return actions.useSkill();
  }

  if (self.position.x < 12) return actions.moveToward(12, self.position.y);

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