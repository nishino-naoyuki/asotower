export function init() {
  return {
    job: "scout",
    initialPosition: { x: 7, y: 11 },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(18, 11);

  if (!self.skill.used) return actions.useSkill(target);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, { x: target.position.x, y: target.position.y - 1 });
  return actions.moveToward(step.x, step.y);
}