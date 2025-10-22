export function init() {
  return {
    job: "healer",
    initialPosition: { x: 27, y: 4 },
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

  if (self.position.x > 26) return actions.moveToward(26, self.position.y);
  return actions.moveToward(self.position.x, self.position.y);
}