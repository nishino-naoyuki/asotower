export function init() {
  return {
    job: "summoner",
    initialPosition: { x: 28, y: 11 },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies, turn } = state;
  const { actions, utils } = api;

  if (!self.skill.used && turn >= 2) return actions.useSkill();

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(22, 11);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}