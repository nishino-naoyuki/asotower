
// アーチャー: マルチショット（扇状に3本の矢を放ち、それぞれ70%威力）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, targets) {
  // targetsは3体まで（扇状に選択）
  if (!Array.isArray(targets) || targets.length === 0) return;
  targets.slice(0, 3).forEach(target => {
    // 70%威力でダメージフラグ
    target.memory.multiShotHit = true;
    target.memory.multiShotPower = 0.7;
  });
  console.log("アーチャー: マルチショット（扇状に3本の矢を放ち、それぞれ70%威力）");
  queueEffect(state, {
    kind: 'skill',
    position: unit.position,
    source: unit.position,
    variant: 'multiShot',
    sound: 'archer_skill',
    jobSounds: [{ job: 'archer', kind: 'skill' }],
    durationMs: 800
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はマルチショットを放った！（3体・各70%威力）` });
}
