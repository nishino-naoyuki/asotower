export function init() {
  return {
    job: "mage",
    initialPosition: { x: 10, y: 9 },
    memory: { burstTurn: -1 }
  };
}

export function update(state, api) {
  const { self, enemies, turn } = state;
  const { actions, utils } = api;

  let weakest = null;
  let minHp = Infinity;
  for (const enemy of enemies) {
    if (enemy.hp < minHp) {
      minHp = enemy.hp;
      weakest = enemy;
    }
  }

  if (!weakest) return actions.moveToward(17, 9);
  if (!self.skill.used && turn >= 3) return actions.useSkill(weakest);
  if (utils.inRange(self, weakest)) return actions.attack(weakest);

  const step = utils.stepToward(self.position, weakest.position);
  return actions.moveToward(step.x, step.y);
}