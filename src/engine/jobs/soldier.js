export function processSkill(state, unit) {}

// ソルジャー: ブレイブチャージ（前方3マス突進＋10秒攻撃+15%）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  unit.memory.braveCharge = true;
  unit.memory.braveChargePower = 1.15;
  unit.memory.braveChargeEndTurn = state.turn + 2; // 10秒相当（2ターン）
  // 突進演出
  queueEffect(state, {
    kind: 'move',
    position: {
      x: unit.position.x + 3 * Math.cos(unit.facing ?? 0),
      y: unit.position.y + 3 * Math.sin(unit.facing ?? 0)
    },
    source: unit.position,
    variant: 'charge',
    sound: 'soldier_skill',
    jobSounds: [{ job: 'soldier', kind: 'skill' }],
    durationMs: 800,
    job: unit.job
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はブレイブチャージ！（前方3マス突進＋10秒攻撃+15%）` });
}
