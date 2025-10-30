import * as utils from "../../shared/unit-utils.js";

export function init() {
  return {
    job: "scout",
    name: "柳町",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 12,
      y: -2
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

// どこに移動するか決める
export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
  //ひたすら城に向かう
  const targetX = enemyCastle.x;
  const targetY = enemyCastle.y;

  return { x: targetX, y: targetY };
}

// 攻撃対象と方法を決める
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