import * as utils from "../../shared/unit-utils.js";

export function init() {
  return {
    job: "sumo",
    name: "番人くん",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 1,
      y: 2
    },
    bonus: { atk: 0, def: 5, spd: 0, hit: 0, hp: 5 }, // 合計10
  };
}

// どこに移動するか決める（最も近い敵がいればその座標、いなければ敵城）
export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
  //自軍の城の近くで敵を待ち構える
  var targetX = allyCastle.x;
  var targetY = allyCastle.y;

  return { x: targetX, y: targetY };
}

// 攻撃対象と方法を決める（射程内の敵がいれば最初の1体を通常攻撃）
export function attack(turn, inRangeEnemies, self) {

  if (inRangeEnemies.length > 0) {
    if( utils.hasUsedSkill(self) == false ) {
      // スキル使用可能なら最初の敵にスキル攻撃
      return { target: inRangeEnemies[0], method: "skill" };
    } else {
      // スキル使用済みなら通常攻撃
      var target = inRangeEnemies[0];
      return { target: target, method: "normal" };
    }
  }
  return null;
}