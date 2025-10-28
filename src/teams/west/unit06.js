export function init() {
  return {
    job: "assassin",
    name: "高寺",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 13,
      y: 0
    },
    memory: { flank: true }
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
    return actions.moveToward(19, 7);
  }

  if (!self.skill.used && target.hp > 20) return actions.useSkill(target);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, { x: target.position.x, y: target.position.y + 1 });
  return actions.moveToward(step.x, step.y);
}