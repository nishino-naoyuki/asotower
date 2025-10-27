
// サモナー: ミニオンコール（HP40攻撃10のミニオン3体を20秒間召喚）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  if (!unit.memory.summoned) {
    unit.memory.summoned = true;
    queueEffect(state, {
      kind: 'summon',
      position: unit.position,
      source: unit.position,
      variant: 'minion',
      sound: 'summoner_skill',
      jobSounds: [{ job: 'summoner', kind: 'skill' }],
      durationMs: 1200
    });
    state.log.push({ turn: state.turn, message: `${unit.name}はミニオンコール！（HP40攻撃10のミニオン3体・20秒間）` });
  }
}
