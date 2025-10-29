export function processSkill(state, unit) {}

// ランサー: リーチブレイク（縦列4マス貫通攻撃＋ノックバック）
import { queueEffect } from '../actions.js';
import { computeDamage, isInRange, getAttackableEnemies } from '../rules.js';

export function doSkill(state, unit, targets) {
  // 新仕様: 縦横4マスにいる敵すべてに攻撃
  const center = unit.position;
  // 2タイル分のピクセル距離
  const range = 2;
  const areaTargets = getAttackableEnemies(state, unit, range);

  if (areaTargets.length === 0) return;
  areaTargets.forEach(target => {
    if (!isInRange(unit, target)) {
      state.log.push({ turn: state.turn, message: `${unit.name} の攻撃は届かなかった` });
      return;
    }
    target.memory.reachBreakHit = true;
    const damage = computeDamage(unit, target);
    target.hp = Math.max(0, target.hp - damage);
    state.log.push({ turn: state.turn, message: `${unit.name} が ${target.name} に ${damage} ダメージ` });
    queueEffect(state, {
      kind: 'attack',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'pierce',
      sound: 'lancer_skill',
      jobSounds: [{ job: 'lancer', kind: 'skill' }],
      impactLabel: `${damage}`,
      job: unit.job
    });
  });
  queueEffect(state, {
    kind: 'skill',
    position: unit.position,
    source: unit.position,
    variant: 'reachBreak',
    sound: 'lancer_skill',
    jobSounds: [{ job: 'lancer', kind: 'skill' }],
    durationMs: 800,
    job: unit.job
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はリーチブレイク！（縦横4マス範囲攻撃）` });
}
