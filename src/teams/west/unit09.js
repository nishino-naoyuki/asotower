export function init() {
  return {
    job: "summoner",
    name: "島田",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 8,
      y: 3
    },
    memory: { summonTurn: -1 }
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
    return actions.moveToward(16, 10);
  }
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}