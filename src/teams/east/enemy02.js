export function init() {
  return {
    job: "soldier",
    initialPosition: { x: 33, y: 7 },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies, turn } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(24, 7);

  if (!self.skill.used && turn > 5) return actions.useSkill(target);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}