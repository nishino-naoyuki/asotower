export function init() {
  return {
    job: "scout",
    initialPosition: { x: 34, y: 12 },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(22, 12);

  if (!self.skill.used) return actions.useSkill(target);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, { x: target.position.x - 1, y: target.position.y });
  return actions.moveToward(step.x, step.y);
}