export function init() {
  return {
    job: "soldier",
    name: "栗原",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 5,
      y: 5
    },
    memory: {}
  };
}

export function update(state, api) {
  const { self, allies } = state;
  const { actions, utils } = api;

  let injured = null;
  for (const ally of allies) {
    if (!injured || ally.hp < injured.hp) injured = ally;
  }

  if (injured && utils.distance(self.position, injured.position) < 6 && !self.skill.used) {
    return actions.useSkill(injured);
  }

  if (self.position.x > 26) return actions.moveToward(26, self.position.y);

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