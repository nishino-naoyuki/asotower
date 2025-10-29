export function processSkill(state, unit) {
  if (unit.hp <= 0) return;
  // soldierBuffのターン管理と解除
  if (unit.hp <= 0) {
    if (unit.memory.soldierBuff) {
      unit.memory.soldierBuff.turns = 0;
      if (unit.memory.soldierBuff.originalAttack !== undefined) {
        unit.stats.attack = unit.memory.soldierBuff.originalAttack;
      }
      delete unit.memory.soldierBuff;
      state.log.push({ turn: state.turn, message: `${unit.name}の攻撃力強化効果が死亡により即時終了。` });
    }
    return;
  }
  if (unit.memory.soldierBuff && unit.memory.soldierBuff.turns > 0) {
    unit.memory.soldierBuff.turns--;
    if (unit.memory.soldierBuff.turns <= 0) {
      if (unit.memory.soldierBuff.originalAttack !== undefined) {
        unit.stats.attack = unit.memory.soldierBuff.originalAttack;
      }
      delete unit.memory.soldierBuff;
      state.log.push({ turn: state.turn, message: `${unit.name}の攻撃力強化効果が終了した。` });
    }
  }
}

// ソルジャー: ブレイブチャージ（前方3マス突進＋10秒攻撃+15%）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  // 元の攻撃力を退避し、1.5倍に設定
  unit.memory.soldierBuff = { turns: 3, originalAttack: unit.stats.attack };
  unit.stats.attack = Math.floor(unit.stats.attack * 1.5);
  queueEffect(state, {
    kind: 'buff',
    position: unit.position,
    source: unit.position,
    variant: 'charge',
    sound: 'soldier_skill',
    jobSounds: [{ job: 'soldier', kind: 'skill' }],
    durationMs: 800,
    job: unit.job
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はブレイブチャージ！（3ターン攻撃力1.5倍）` });
}

