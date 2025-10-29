export function init() {
  return {
    job: "healer",
    name: "大山",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 11,
      y: -2
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
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

  const castle = state.enemyCastle;
  if (castle?.position) {
    const dist = utils.distance(self.position, castle.position);
    const range = self.stats.range / 10;
    if (dist <= range) {
      return actions.attackCastle();
    }
    return actions.moveToward(castle.position.x, castle.position.y);
  }

  return actions.moveToward(self.position.x, self.position.y);
}