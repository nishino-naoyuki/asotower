export function init() {
  return {
    job: "archer",
    initialPosition: { x: 31, y: 5 },
    memory: { focusId: null }
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(22, 5);

  if (utils.inRange(self, target)) {
    state.memory.focusId = target.id;
    return actions.attack(target);
  }

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}