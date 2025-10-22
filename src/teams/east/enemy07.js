export function init() {
  return {
    job: "engineer",
    initialPosition: { x: 36, y: 8 },
    memory: { deployed: false }
  };
}

export function update(state, api) {
  const { self, memory } = state;
  const { actions } = api;

  if (!memory.deployed) {
    memory.deployed = true;
    return actions.useSkill();
  }

  if (self.position.x > 28) return actions.moveToward(28, self.position.y);
  return actions.moveToward(self.position.x, self.position.y);
}