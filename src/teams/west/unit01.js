export function init() {
  return {
    job: "guardian",
    initialPosition: { x: 4, y: 5 },
    memory: { defending: true }
  };
}

export function update(state, api) {
  const { self, enemies } = state;
  const { actions, utils } = api;

  let closest = null;
  let minCastleDist = Infinity;
  for (const enemy of enemies) {
    const dist = utils.distance(enemy.position, { x: 4, y: 8 });
    if (dist < minCastleDist) {
      minCastleDist = dist;
      closest = enemy;
    }
  }

  if (!closest) return actions.moveToward(10, self.position.y);
  if (utils.inRange(self, closest)) return actions.attack(closest);

  const step = utils.stepToward(self.position, closest.position);
  return actions.moveToward(step.x, step.y);
}