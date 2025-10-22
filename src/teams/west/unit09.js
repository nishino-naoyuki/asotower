export function init() {
  return {
    job: "summoner",
    initialPosition: { x: 9, y: 10 },
    memory: { summonTurn: -1 }
  };
}

export function update(state, api) {
  const { self, enemies, turn } = state;
  const { actions, utils } = api;

  if (!self.skill.used && turn >= 2) return actions.useSkill();

  const target = utils.findClosest(enemies, self.position);
  if (!target) return actions.moveToward(16, 10);
  if (utils.inRange(self, target)) return actions.attack(target);

  const step = utils.stepToward(self.position, target.position);
  return actions.moveToward(step.x, step.y);
}