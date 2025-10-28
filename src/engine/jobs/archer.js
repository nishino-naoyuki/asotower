export function processSkill(state, unit) {}

// アーチャー: マルチショット（扇状に3本の矢を放ち、それぞれ70%威力）
import { queueEffect } from '../actions.js';
import { computeDamage } from '../rules.js';

export function doSkill(state, unit, targets) {
  // targetsは3体まで（扇状に選択）
  if (!Array.isArray(targets) || targets.length === 0) return;
  targets.slice(0, 3).forEach(target => {
    const damage = Math.floor(computeDamage(unit, target) * 0.7);
    target.hp = Math.max(0, target.hp - damage);
    state.log.push({ turn: state.turn, message: `${unit.name}のマルチショット → ${target.name}に${damage}ダメージ` });
    queueEffect(state, {
      kind: 'attack',
      position: target.position,
      source: unit.position,
      target: target.position,
      variant: 'multiShot',
      sound: 'archer_skill',
      jobSounds: [{ job: 'archer', kind: 'skill' }],
      impactLabel: `${damage}`,
      job: unit.job
    });
  });
  console.log("アーチャー: マルチショット（扇状に3本の矢を放ち、それぞれ70%威力）");
  queueEffect(state, {
    kind: 'skill',
    position: unit.position,
    source: unit.position,
    variant: 'multiShot',
    sound: 'archer_skill',
    jobSounds: [{ job: 'archer', kind: 'skill' }],
    durationMs: 800,
    job: unit.job
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はマルチショットを放った！（3体・各70%威力）` });
}
