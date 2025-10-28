export function init() {
  return {
    job: "sumo",
    name: "近本",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 3,
      y: -2
    },
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

  if (!closest) {
    const castle = state.enemyCastle;
    if (castle?.position) {
      const dist = utils.distance(self.position, castle.position);
      const range = self.stats.range / 10;
      if (dist <= range) {
        return actions.attackCastle();
      }
      return actions.moveToward(castle.position.x, castle.position.y);
    }
    return actions.moveToward(10, self.position.y);
  }

  if (utils.inRange(self, closest)) return actions.attack(closest);

  const step = utils.stepToward(self.position, closest.position);
  return actions.moveToward(step.x, step.y);
}