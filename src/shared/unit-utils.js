import { rangePerTurn } from "../engine/rules.js";
/**
 * ダメージを受けている味方を配列で取得する（グローバルstateから取得）
 * @param {Object} self - 自分ユニット
 * @returns {Array} ダメージを受けている味方ユニット配列
 */
export function getDamagedAllies(self) {
  const state = window.__ASOTOWER_STATE__;
  
  if (!state) return [];
  const allies = state.units.filter(u => u.side === self.side && u.id !== self.id && u.hp > 0);
  return allies.filter(ally => ally.hp < ally.stats.hp);
}
/**
 * ユニットがスキルを既に使ったか判定する
 * @param {Object} unit - 判定対象ユニット
 * @returns {boolean} 既に使っていればtrue
 */
export function hasUsedSkill(unit) {
  return !!(unit.skill && unit.skill.used);
}

// 射程に敵城が入っているか判定
export function isEnemyCastleInRange(self, range = null) {
  const state = window.__ASOTOWER_STATE__;
  if (!state) return false;
  const enemySide = self.side === 'west' ? 'east' : 'west';
  const castle = state?.map?.castles?.[enemySide];
  if (!castle) return false;
    const dist = Math.hypot(self.position.x - castle.x, self.position.y - castle.y);
    const attackRange = range !== null ? range : rangePerTurn(self);
  //console.log("dist:", dist, " attackRange:", attackRange);
  return dist <= attackRange;
}

// 敵城座標を取得
export function getEnemyCastlePosition(self) {
  const state = window.__ASOTOWER_STATE__;
  if (!state) return null;
  const enemySide = self.side === 'west' ? 'east' : 'west';
  return state?.map?.castles?.[enemySide] ?? null;
}
// ユニットAI・行動ロジック用の汎用関数をまとめるファイル
// 例: 距離計算、最も近い敵の取得など

// 2点間の距離（タイル単位）を計算
export function distanceBetween(a, b) {
  if (!a || !b) return 0;
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 配列から最も近いユニットを取得
export function findNearest(self, units) {
  var minDist = 99999;
  var nearest = null;
  for (var i = 0; i < units.length; i++) {
    var dist = distanceBetween(self.position, units[i].position);
    if (dist < minDist) {
      minDist = dist;
      nearest = units[i];
    }
  }
  return nearest;
}


// 自分から最も遠い敵の位置を取得
export function findFarthestEnemyPosition(self, enemies) {
  let maxDist = -1;
  let farthest = null;
  for (let i = 0; i < enemies.length; i++) {
    if( isScoutInSkillMode(enemies[i])) {
      //ステルス中の敵は除外
      continue;
    }
    const dist = distanceBetween(self.position, enemies[i].position);
    if (dist > maxDist) {
      maxDist = dist;
      farthest = enemies[i];
    }
  }
  return farthest ? { x: farthest.position.x, y: farthest.position.y } : null;
}

// 指定したユニットの場所情報を取得
export function getUnitPosition(unit) {
  return unit.position ? { x: unit.position.x, y: unit.position.y } : null;
}

// 指定したユニットの残りHPを取得
export function getUnitHp(unit) {
  return typeof unit.hp === "number" ? unit.hp : null;
}


// 指定したユニットのジョブを取得
export function getUnitJob(unit) {
  return unit.job || null;
}

// ユニット配列から指定ジョブのユニットを取得（複数の場合は配列で返す）
export function getUnitsByJob(units, jobName) {
  if (!Array.isArray(units)) return [];
  return units.filter(u => u.job === jobName);
}

export function isScoutInSkillMode(self) {
  return (
    self.job === 'scout' &&
    self.skill &&
    self.memory &&
    self.memory.stealth &&
    typeof self.memory.stealth.turns === 'number' &&
    self.memory.stealth.turns > 0
  );
}