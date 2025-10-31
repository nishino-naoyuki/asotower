// エンジニア: タレット配置（射程20・攻撃15/秒の砲台を30秒間召喚）
import { queueEffect } from '../actions.js';
import { computeDamage,getAttackableEnemies } from '../rules.js';

const SKILL_RANGE = 20;
const SKILL_ATTACK = 15;
const SKILL_DURATION_TURNS = 3;

export function processSkill(state, unit) {
  // タレットが設置されていて、残りターンがある場合
  if (unit.memory.turretTurns && unit.memory.turretTurns > 0) {
    // 射程20以内の敵を検索
    doSkillProcess(state, unit);
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
    unit.memory.turretTurns = SKILL_DURATION_TURNS;
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
    doSkillProcess(state, unit);
  }
}
// 距離計算関数（ユーティリティ）
function distance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function doSkillProcess(state, unit) {
  // スキル発動処理
  const enemies = getAttackableEnemies(state, unit, SKILL_RANGE);
  const turret = {
    ...unit,
    stats: { ...unit.stats, attack: SKILL_ATTACK }
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