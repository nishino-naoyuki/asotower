export function init() {
  return {
    job: "lancer",
    initialPosition: { x: 32, y: 6 },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(23, 6);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}