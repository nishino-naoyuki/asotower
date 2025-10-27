
// ヒーラー: メディカ（味方1体即時150回復＋弱体解除）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  if (target && target.hp < target.stats.hp) {
    target.hp = Math.min(target.stats.hp, target.hp + 150);
    target.memory.debuffs = [];
    queueEffect(state, {
      kind: 'heal',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'medica',
      sound: 'healer_skill',
      jobSounds: [{ job: 'healer', kind: 'skill' }],
      impactLabel: '+150'
    });
    state.log.push({ turn: state.turn, message: `${unit.name}は${target.name}をメディカ！（150回復＋弱体解除）` });
  }
}
