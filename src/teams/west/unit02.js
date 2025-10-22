export function init() {
  return {
    job: "soldier",
    initialPosition: { x: 6, y: 6 },
    memory: { lastTurn: -1 }
  };
}

export function update(state, api) {
  const { self, enemies, turn } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(15, 6);

  if (!self.skill.used && turn > 5) return actions.useSkill(target);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}