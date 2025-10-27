
// ガーディアン: フォートレス（8秒間被ダメ-40%＋ヘイト上昇）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  unit.memory.fortress = true;
  unit.memory.fortressEndTurn = state.turn + 2; // 8秒相当（2ターン）
  unit.memory.hateUp = true;
  queueEffect(state, {
    kind: 'buff',
    position: unit.position,
    source: unit.position,
    variant: 'fortress',
    sound: 'guardian_skill',
    jobSounds: [{ job: 'guardian', kind: 'skill' }],
    durationMs: 800
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はフォートレス！（8秒間被ダメ-40%＋ヘイト上昇）` });
}
