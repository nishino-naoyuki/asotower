export function init() {
  return {
    job: "assassin",
    initialPosition: { x: 25, y: 9 },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(21, 9);

  if (!self.skill.used && target.hp > 18) return actions.useSkill(target);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, { x: target.position.x, y: target.position.y - 1 });
  return actions.moveToward(step.x, step.y);
}