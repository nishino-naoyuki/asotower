export function init() {
  return {
    job: "guardian",
    initialPosition: { x: 35, y: 6 },
    memory: {}
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const closest = utils.findClosest(enemies, self.position);
  if (!closest) return actions.moveToward(22, 6);
  if (utils.inRange(self, closest)) return actions.attack(closest);

  const step = utils.stepToward(self.position, closest.position);
  return actions.moveToward(step.x, step.y);
}