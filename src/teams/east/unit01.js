import * as utils from "../../shared/unit-utils.js";

export function init() {
  return {
    job: "sumo",
    name: "柳田",
    initialPosition: {
      relativeTo: "allyCastle",
      x: 13,
      y: 0
    },
    memory: {},
    bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
  };
}

// どこに移動するか決める（最も近い敵がいればその座標、いなければ敵城）
export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
  var targetX = self.position.x;
  var targetY = self.position.y;
  //console.log("Turn:", turn,"enemies length:", enemies.length);
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
  console.log("InRangeEnemies:", inRangeEnemies.map(e => e.name),"unitrange:",self.stats.range);
  if (inRangeEnemies.length > 0) {
    //最も近い敵を取得
    var target = utils.findNearest(self, inRangeEnemies);
    
    if(utils.hasUsedSkill(self) == false ){      
      console.log("Use Skill on", target.name);
      return { target: target, method: "skill" };
    }else{
      return { target: target, method: "normal" };
    }
  }
  return null;
}