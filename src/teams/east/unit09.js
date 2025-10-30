import * as utils from "../../shared/unit-utils.js";

export function init() {
  return {
    job: "scout",
    name: "牧原",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 1,
      y: -5
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

// どこに移動するか決める（最も近い敵がいればその座標、いなければ敵城）
export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {

  const targetX = enemyCastle.x;
  const targetY = enemyCastle.y;

  return { x: targetX, y: targetY };
}

// 攻撃対象と方法を決める（射程内の敵がいれば最初の1体を通常攻撃）
export function attack(turn, inRangeEnemies, self) {

  //城が射程に入れば攻撃する
  if( utils.isEnemyCastleInRange(self)){
    return { target: self, method: "CastleAttack" };
  }else if(inRangeEnemies.length > 0){
    if( utils.hasUsedSkill(self)){
      return { target: inRangeEnemies[0], method: "normal" };
    }else{
      return { target: self, method: "skill" };
    }
  }
  return null;
}