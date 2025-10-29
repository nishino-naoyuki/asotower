export function processSkill(state, unit) {}

// 相撲レスラー: 土俵轟砕（半径1.5マス体当たり・250%攻撃＋ノックバック2マス・8秒間被ダメ-30%）
import { queueEffect } from '../actions.js';
import { getAttackableEnemies, computeDamage } from '../rules.js';
export function doSkill(state, unit, targets) {
  // 半径2マス（ピクセル換算）範囲内の敵全体に攻撃
  const tileSize = state.map?.tileSize || 64;
  const range = tileSize * 2;
  const center = unit.position;
  // 自軍城の位置
  const castle = state.map?.castles?.[unit.side];
  const targetsInRange = getAttackableEnemies(state, unit, range);
  if (targetsInRange.length === 0) return;
  targetsInRange.forEach(target => {
    // ダメージ計算（100%）
    const damage = computeDamage(unit, target);
    target.hp = Math.max(0, target.hp - damage);
    // ノックバック方向（自軍城と逆方向に4マス）
    let dx = 0, dy = 0;
    if (castle) {
      dx = target.position.x - castle.x;
      dy = target.position.y - castle.y;
      const len = Math.hypot(dx, dy) || 1;
      dx = dx / len;
      dy = dy / len;
    }
    // 逆方向に4マス分移動
    target.position.x += dx * 4;
    target.position.y += dy * 4;
    queueEffect(state, {
      kind: 'attack',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'bodySlam',
      sound: 'sumo_skill',
      jobSounds: [{ job: 'sumo', kind: 'skill' }],
      impactLabel: `${damage}`,
      job: unit.job
    });
    queueEffect(state, {
      kind: 'knockback',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'knockback',
      sound: 'sumo_skill',
      jobSounds: [{ job: 'sumo', kind: 'skill' }],
      durationMs: 600,
      job: unit.job
    });
  });
  queueEffect(state, {
    kind: 'skill',
    position: unit.position,
    source: unit.position,
    variant: 'bodySlam',
    sound: 'sumo_skill',
    jobSounds: [{ job: 'sumo', kind: 'skill' }],
    durationMs: 800,
    job: unit.job
  });
  state.log.push({ turn: state.turn, message: `${unit.name}は土俵轟砕！（半径2マス範囲攻撃＋ノックバック4マス）` });
}
