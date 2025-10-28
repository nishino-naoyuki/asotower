export function processSkill(state, unit) {
  // ステルス状態のターン管理と解除
  if (unit.memory.stealth && unit.memory.stealth.turns > 0) {
    unit.memory.stealth.turns--;
    if (unit.memory.stealth.turns <= 0) {
      delete unit.memory.stealth;
      state.log.push({ turn: state.turn, message: `${unit.name}のステルス効果が終了した。` });
    }
  }
}

// スカウト: リコンパルス（10秒ステルス＋範囲敵情報共有）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  unit.memory.stealth = { turns: 2 };
  queueEffect(state, {
    kind: 'buff',
    position: unit.position,
    source: unit.position,
    variant: 'stealth',
    sound: 'scout_skill',
    jobSounds: [{ job: 'scout', kind: 'skill' }],
    durationMs: 800,
    job: unit.job
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はリコンパルス！（2ターンステルス化）` });
}

