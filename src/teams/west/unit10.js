import * as utils from "../../shared/unit-utils.js";

export function init() {
  return {
    job: "scout",
    name: "隠密さん",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 6,
      y: 4
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

// どこに移動するか決める（最も近い敵がいればその座標、いなければ敵城）
export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
  //ひたすら城に向かう
  const targetX = enemyCastle.x;
  const targetY = enemyCastle.y;

  return { x: targetX, y: targetY };
}

// 攻撃対象と方法を決める（射程内の敵がいれば最初の1体を通常攻撃）
export function attack(turn, inRangeEnemies, self) {
  //敵が近くに来たら隠密行動（スキル発動）する
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