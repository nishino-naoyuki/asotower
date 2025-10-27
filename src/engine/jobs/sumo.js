
// 相撲レスラー: 土俵轟砕（半径1.5マス体当たり・250%攻撃＋ノックバック2マス・8秒間被ダメ-30%）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, targets) {
  unit.memory.sumoSkill = true;
  unit.memory.sumoSkillEndTurn = state.turn + 2; // 8秒相当（2ターン）
  if (!Array.isArray(targets) || targets.length === 0) return;
  targets.forEach(target => {
    target.memory.sumoHit = true;
    target.memory.sumoPower = 2.5; // 250%
    target.memory.knockback = 2;
    queueEffect(state, {
      kind: 'attack',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'bodySlam',
      sound: 'sumo_skill',
      jobSounds: [{ job: 'sumo', kind: 'skill' }],
      impactLabel: '250%'
    });
  });
  queueEffect(state, {
    kind: 'buff',
    position: unit.position,
    source: unit.position,
    variant: 'sumoGuard',
    sound: 'sumo_skill',
    jobSounds: [{ job: 'sumo', kind: 'skill' }],
    durationMs: 800
  });
  state.log.push({ turn: state.turn, message: `${unit.name}は土俵轟砕！（半径1.5マス体当たり・250%攻撃＋ノックバック2マス・8秒間被ダメ-30%）` });
}
