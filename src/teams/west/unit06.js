import * as utils from "../../shared/unit-utils.js";

export function init() {
  return {
    job: "assassin",
    name: "どどめくん",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 13,
      y: 0
    },
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

// どこに移動するか決める（最も近い敵がいればその座標、いなければ敵城）
export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
  //一番ＨＰが低い敵に向かう
  const hplowenemy = utils.getLowestHpEnemyInRange(self);
  
  var targetX = self.position.x;
  var targetY = self.position.y;

  if(!hplowenemy){
    //敵がいなければ敵城に向かう
    targetX = enemyCastle.x;
    targetY = enemyCastle.y;
  }else{
    //敵がいればその敵に向かう
    targetX = hplowenemy.position.x;
    targetY = hplowenemy.position.y;
  }

  return { x: targetX, y: targetY };
}

// 攻撃対象と方法を決める（射程内の敵がいれば最初の1体を通常攻撃）
export function attack(turn, inRangeEnemies, self) {
  //ＨＰが低い敵にスキルを使ってとどめを刺す
  const hplowenemy = utils.getLowestHpEnemyInRange(self);
  
  if(hplowenemy && utils.hasUsedSkill(self) === false){
    return { target: hplowenemy, method: "skill" };
  }else {
    if (inRangeEnemies.length > 0) {
      var target = inRangeEnemies[0];
      return { target: target, method: "normal" };
    }
  }
  return null;
}