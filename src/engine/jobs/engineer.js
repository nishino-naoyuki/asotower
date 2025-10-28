// エンジニア: タレット配置（射程20・攻撃15/秒の砲台を30秒間召喚）
import { queueEffect } from '../actions.js';
import { computeDamage } from '../rules.js';

export function processSkill(state, unit) {
  // タレットが設置されていて、残りターンがある場合
  if (unit.memory.turretTurns && unit.memory.turretTurns > 0) {
    // 射程20以内の敵を検索
  const enemies = getAttackableEnemies(state, unit, 20);
    const turret = {
      ...unit,
      stats: { ...unit.stats, attack: 15 }
    };
  enemies.forEach(target => {
      const damage = computeDamage(turret, target);
      target.hp = Math.max(0, target.hp - damage);
      queueEffect(state, {
        kind: 'damage',
        position: target.position,
        source: unit.position,
        variant: 'turret',
        sound: 'engineer_skill',
        jobSounds: [{ job: 'engineer', kind: 'skill' }],
        amount: damage,
        job: unit.job
      });
      state.log.push({ turn: state.turn, message: `${unit.name}のタレットが${target.name}に${damage}ダメージ！` });
    });
    unit.memory.turretTurns--;
    // タレット効果終了
    if (unit.memory.turretTurns === 0) {
      state.log.push({ turn: state.turn, message: `${unit.name}のタレット効果が終了した。` });
      unit.memory.deployed = false;
    }
  }
}

export function doSkill(state, unit, target) {
  if (!unit.memory.deployed) {
    unit.memory.deployed = true;
    unit.memory.turretTurns = 3;
    // タレット召喚（演出）
    queueEffect(state, {
      kind: 'summon',
      position: unit.position,
      source: unit.position,
      variant: 'turret',
      sound: 'engineer_skill',
      jobSounds: [{ job: 'engineer', kind: 'skill' }],
      durationMs: 1200,
      job: unit.job
    });
    state.log.push({ turn: state.turn, message: `${unit.name}はタレットを設置した！（3ターン攻撃15/射程20）` });
    // 1回目の攻撃
    const enemies = state.units.filter(u => u.side !== unit.side && u.hp > 0 && distance(unit.position, u.position) <= 20);
    const turret = {
      ...unit,
      stats: { ...unit.stats, attack: 15 }
    };
    enemies.forEach(target => {
      const damage = computeDamage(turret, target);
      target.hp = Math.max(0, target.hp - damage);
      queueEffect(state, {
        kind: 'damage',
        position: target.position,
        source: unit.position,
        variant: 'turret',
        sound: 'engineer_skill',
        jobSounds: [{ job: 'engineer', kind: 'skill' }],
        amount: damage,
        job: unit.job
      });
      state.log.push({ turn: state.turn, message: `${unit.name}のタレットが${target.name}に${damage}ダメージ！` });
    });
    unit.memory.turretTurns--;
  }
}
// 距離計算関数（ユーティリティ）
function distance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
