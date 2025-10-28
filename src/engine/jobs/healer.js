export function processSkill(state, unit) {}

// ヒーラー: メディカ（味方1体即時150回復＋弱体解除）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  // 味方全員を即時20回復
  const allies = state.units.filter(u => u.team === unit.team && u.hp > 0);
  allies.forEach(target => {
    const before = target.hp;
    target.hp = Math.min(target.stats.hp, target.hp + 20);
    // 通常回復エフェクト
    queueEffect(state, {
      kind: 'heal',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'medica',
      sound: 'healer_skill',
      jobSounds: [{ job: 'healer', kind: 'skill' }],
      impactLabel: `+${target.hp - before}`,
      job: unit.job
    });
    // 白い光で包むスペシャルエフェクト＋super_healサウンド
    queueEffect(state, {
      kind: 'heal_special',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'medica_all',
      job: unit.job,
      durationMs: 700,
      sound: 'super_heal'
    });
  });
  state.log.push({ turn: state.turn, message: `${unit.name}は味方全員をメディカ！（全員20回復）` });
}
