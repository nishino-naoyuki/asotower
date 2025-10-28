// 攻撃可能な敵ユニット一覧を取得（ステルス除外、範囲指定可）
export function getAttackableEnemies(state, unit, range = null) {
  return state.units.filter(target => {
    if (target.side === unit.side) return false;
    if (target.hp <= 0) return false;
    if (target.memory?.stealth?.turns > 0) return false;
    if (range !== null) {
      // isInRangeで判定（unitの射程をrangeで上書き）
      const tileSize = state.map?.tileSize || 64;
      const dx = target.position.x - unit.position.x;
      const dy = target.position.y - unit.position.y;
      if (Math.sqrt(dx * dx + dy * dy) > range) return false;
    }
    return true;
  });
}
import { JOB_DATA } from "../data/jobs.js?v=202510231119";

export function computeDamage(attacker, defender) {
  const attack = attacker.stats.attack;
  const defense = defender.stats.defense;
  let dmg = Math.max(1, attack - defense * 0.5);

  const attJob = JOB_DATA[attacker.job];
  const defJob = JOB_DATA[defender.job];
  if (attJob?.affinity?.attack === defender.job) {
    dmg *= 1.2;
  }
  if (attJob?.affinity?.vulnerable === defender.job) {
    dmg *= 1.0;
  }
  if (defJob?.affinity?.vulnerable === attacker.job) {
    dmg *= 1.5;
  }

  const jitter = 0.95 + Math.random() * 0.1;
  dmg *= jitter;

  const critChance = 0.05;
  if (Math.random() < critChance) {
    dmg *= 1.5;
  }

  return Math.floor(dmg);
}

export function movementPerTurn(unit) {
  return unit.stats.speed / 10;
}

export function isInRange(attacker, target) {
  // タイル数→ピクセル距離に変換
  const tileSize = attacker.state?.map?.tileSize || 64;
  const range = rangePerTurn(attacker) * tileSize;
  const dx = target.position.x - attacker.position.x;
  const dy = target.position.y - attacker.position.y;
  const dist = Math.hypot(dx, dy);
  return dist <= range;
}

export function rangePerTurn(unit) {
  // タイル数で返す（ピクセル換算はisInRange側で行う）
  return unit.stats.range / 10;
}