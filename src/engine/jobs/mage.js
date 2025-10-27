
// メイジ: エレメンタルバースト（半径2マスに5秒間継続ダメージ 総計250%）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, targets) {
  if (!Array.isArray(targets) || targets.length === 0) return;
  targets.forEach(target => {
    target.memory.elementalBurst = true;
    target.memory.dotPower = 2.5; // 250%
    queueEffect(state, {
      kind: 'attack',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'magic',
      sound: 'mage_skill',
      jobSounds: [{ job: 'mage', kind: 'skill' }],
      impactLabel: 'DoT'
    });
  });
  queueEffect(state, {
    kind: 'skill',
    position: unit.position,
    source: unit.position,
    variant: 'elementalBurst',
    sound: 'mage_skill',
    jobSounds: [{ job: 'mage', kind: 'skill' }],
    durationMs: 1200
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はエレメンタルバースト！（半径2マス・5秒継続ダメージ）` });
}
