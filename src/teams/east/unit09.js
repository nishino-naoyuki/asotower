export function init() {
  return {
    job: "summoner",
    name: "East Unit 09",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 0,
      y: 4
    },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies, turn } = state;
  const { actions, utils } = api;

  if (!self.skill.used && turn >= 2) return actions.useSkill();

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
    return actions.moveToward(22, 11);
  }
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}