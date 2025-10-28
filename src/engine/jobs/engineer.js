
// エンジニア: タレット配置（射程20・攻撃15/秒の砲台を30秒間召喚）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  if (!unit.memory.deployed) {
    unit.memory.deployed = true;
    // タレット召喚（実体はengineで管理、ここでは演出のみ）
    queueEffect(state, {
      kind: 'summon',
      position: unit.position,
      source: unit.position,
      variant: 'turret',
      sound: 'engineer_skill',
      jobSounds: [{ job: 'engineer', kind: 'skill' }],
      durationMs: 1200,
      job: unit.job
    });
    state.log.push({ turn: state.turn, message: `${unit.name}はタレットを設置した！（30秒間攻撃15/秒）` });
  }
}
