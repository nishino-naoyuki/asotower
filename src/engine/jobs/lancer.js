
// ランサー: リーチブレイク（縦列4マス貫通攻撃＋ノックバック）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, targets) {
  // targets: 縦列4マス内の敵
  if (!Array.isArray(targets) || targets.length === 0) return;
  targets.forEach(target => {
    target.memory.reachBreakHit = true;
    target.memory.knockback = 1;
      queueEffect(state, {
        kind: 'attack',
        position: target.position,
        source: unit.position,
        target: target.position,
        variant: 'pierce',
        sound: 'lancer_skill',
        jobSounds: [{ job: 'lancer', kind: 'skill' }],
        impactLabel: '貫通',
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
  state.log.push({ turn: state.turn, message: `${unit.name}はリーチブレイク！（縦列4マス貫通＋ノックバック）` });
}
