export function init() {
  return {
    job: "mage",
    name: "川瀬",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 15,
      y: -2
    },
    memory: {}
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
    return actions.moveToward(21, 9);
  }

  if (!self.skill.used && target.hp > 18) return actions.useSkill(target);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, { x: target.position.x, y: target.position.y - 1 });
  return actions.moveToward(step.x, step.y);
}