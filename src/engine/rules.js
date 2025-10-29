// 攻撃可能な敵ユニット一覧を取得（ステルス除外、範囲指定可）
export function getAttackableEnemies(state, unit, range = null) {
  const effectiveRange = range !== null ? range : rangePerTurn(unit);
  return state.units.filter(target => {
    if (target.side === unit.side) return false;
    if (target.hp <= 0) return false;
    if (target.memory?.stealth?.turns > 0) return false;
    // 射程判定
    const dx = target.position.x - unit.position.x;
    const dy = target.position.y - unit.position.y;
    if (Math.sqrt(dx * dx + dy * dy) > effectiveRange) return false;
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
  // getAttackableEnemiesを使って判定
  const targets = getAttackableEnemies({ units: [target] }, attacker);
  return targets.length > 0;
}

export function rangePerTurn(unit) {
  // タイル数で返す（ピクセル換算はisInRange側で行う）
  return unit.stats.range / 10;
}