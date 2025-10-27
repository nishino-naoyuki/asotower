
// アサシン: シャドウステップ（瞬時に2マス移動＋背後200%ダメージ）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  unit.memory.shadowStep = true;
  unit.memory.shadowStepPower = 2.0;
  // 背後2マス移動（仮: targetの背後方向）
  if (target) {
    const dx = target.position.x - unit.position.x;
    const dy = target.position.y - unit.position.y;
    const dist = Math.hypot(dx, dy) || 1;
    unit.position.x = target.position.x + dx / dist * 2;
    unit.position.y = target.position.y + dy / dist * 2;
    queueEffect(state, {
      kind: 'move',
      position: unit.position,
      source: unit.position,
      variant: 'shadowStep',
      sound: 'assassin_skill',
      jobSounds: [{ job: 'assassin', kind: 'skill' }],
      durationMs: 600
    });
    queueEffect(state, {
      kind: 'attack',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'critical',
      sound: 'assassin_skill',
      jobSounds: [{ job: 'assassin', kind: 'skill' }],
      impactLabel: '200%'
    });
    state.log.push({ turn: state.turn, message: `${unit.name}はシャドウステップ！（背後2マス移動＋200%ダメージ）` });
  }
}
