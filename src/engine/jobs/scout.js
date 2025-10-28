export function processSkill(state, unit) {}

// スカウト: リコンパルス（10秒ステルス＋範囲敵情報共有）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  unit.memory.reconPulse = true;
  unit.memory.stealthEndTurn = state.turn + 2; // 10秒相当（2ターン）
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
  state.log.push({ turn: state.turn, message: `${unit.name}はリコンパルス！（10秒ステルス＋範囲敵情報共有）` });
}
