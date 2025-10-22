export function init() {
  return {
    job: "healer",
    initialPosition: { x: 12, y: 5 },
    memory: {}
  };
}

export function update(state, api) {
  const { self, allies } = state;
  const { actions, utils } = api;

  let injured = null;
  for (const ally of allies) {
    if (!injured || ally.hp < injured.hp) injured = ally;
  }

  if (injured && utils.distance(self.position, injured.position) < 6 && !self.skill.used) {
    return actions.useSkill(injured);
  }

  const anchorX = 14;
  if (self.position.x < anchorX) return actions.moveToward(anchorX, self.position.y);

  return actions.moveToward(self.position.x, self.position.y);
}