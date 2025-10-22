export function init() {
  return {
    job: "engineer",
    initialPosition: { x: 3, y: 9 },
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

  if (self.position.x < 12) return actions.moveToward(12, self.position.y);
  return actions.moveToward(self.position.x, self.position.y);
}