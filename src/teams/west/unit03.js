export function init() {
  return {
    job: "archer",
    initialPosition: { x: 8, y: 4 },
    memory: { focusId: null }
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(18, 4);

  if (utils.inRange(self, target)) {
    state.memory.focusId = target.id;
    return actions.attack(target);
  }

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}