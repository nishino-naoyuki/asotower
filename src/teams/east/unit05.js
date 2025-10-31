import * as utils from "../../shared/unit-utils.js";

export function init() {
  return {
    job: "soldier",
    name: "栗原",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 5,
      y: 5
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

// どこに移動するか決める（最も近い敵がいればその座標、いなければ敵城）
export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
  var targetX = self.position.x;
  var targetY = self.position.y;

  if (enemies.length > 0) {
    var nearest = utils.findNearest(self, enemies);
    targetX = nearest.position.x;
    targetY = nearest.position.y;
  } else if (enemyCastle && enemyCastle.position) {
    targetX = enemyCastle.x;
    targetY = enemyCastle.y;
  }

  return { x: targetX, y: targetY };
}

// 攻撃対象と方法を決める（射程内の敵がいれば最初の1体を通常攻撃）
export function attack(turn, inRangeEnemies, self) {
  if (inRangeEnemies.length > 0) {
    if( utils.hasUsedSkill(self) == false  ){
      return { target: self, method: "skill" };
    }else{
      return { target: inRangeEnemies[0], method: "normal" };
    }
  }
  return null;
}