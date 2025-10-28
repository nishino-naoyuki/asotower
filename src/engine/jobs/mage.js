
// メイジ: エレメンタルバースト（半径2マスに5秒間継続ダメージ 総計250%）
import { queueEffect } from '../actions.js';
import { computeDamage } from '../rules.js';
export function processSkill(state, unit) {
  // 継続ダメージ処理
  if (unit.memory.mageDot && unit.memory.mageDot.turns > 0) {
    // 毎ターン、mageDot.positionを最新のunit.positionに更新（magefireが移動に追従）
    unit.memory.mageDot.position = { ...unit.position };
    const center = unit.memory.mageDot.position;
    // 2タイル分のピクセル距離
    const tileSize = state.map.tileSize || 64;
    const range = tileSize * 2;
    // 攻撃力20の仮想ユニット
    const dotUnit = {
      ...unit,
      stats: { ...unit.stats, attack: 20 }
    };
    const targets = getAttackableEnemies(state, unit, range);
    targets.forEach(target => {
      const damage = computeDamage(dotUnit, target);
      target.hp = Math.max(0, target.hp - damage);
      queueEffect(state, {
        kind: 'attack',
        position: target.position,
        source: center,
        target: target.position,
        variant: 'magic',
        sound: 'mage_skill',
        jobSounds: [{ job: 'mage', kind: 'skill' }],
        impactLabel: `${damage}`,
        job: unit.job
      });
      state.log.push({ turn: state.turn, message: `${unit.name}のエレメンタルバースト継続ダメージ → ${target.name}に${damage}ダメージ` });
    });
    unit.memory.mageDot.turns--;
    if (unit.memory.mageDot.turns <= 0) {
      delete unit.memory.mageDot;
      state.log.push({ turn: state.turn, message: `${unit.name}のエレメンタルバースト効果が終了した。` });
    }
  }
}

export function doSkill(state, unit, targets) {
  // スキル発動時: 3ターン継続ダメージ情報をmemoryにセット
  unit.memory.mageDot = {
    turns: 3,
    position: { ...unit.position }
  };
  queueEffect(state, {
    kind: 'skill',
    position: unit.position,
    source: unit.position,
    variant: 'elementalBurst',
    sound: 'mage_skill',
    jobSounds: [{ job: 'mage', kind: 'skill' }],
    durationMs: 1200,
    job: unit.job
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はエレメンタルバースト！（半径2マス・3ターン継続ダメージ）` });
}
