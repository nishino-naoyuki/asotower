// サモナー: ミニオンコール（HP40攻撃10のミニオン3体を20秒間召喚）
import { queueEffect } from '../actions.js';

export function doSkill(state, unit, target) {
  // 既に召喚済みなら何もしない
  if (unit.memory.summonedChampion) return;

  // 進行方向（仮: x+1）に召喚
  const summonPos = { x: unit.position.x + 1, y: unit.position.y };
  const champion = {
    id: `champion_${unit.id}_${state.turn}`,
    name: 'チャンピオン',
    job: 'monster',
    side: unit.side,
    position: { ...summonPos },
    stats: {
      hp: 15,
      attack: 35,
      speed: 0,
      range: 15,
      vision: 15,
      defense: 0
    },
    hp: 15,
    memory: { summonedChampion: { turns: 5 } }
  };
  state.units.push(champion);
  unit.memory.summonedChampion = champion.id;
  queueEffect(state, {
    kind: 'summon',
    position: champion.position,
    source: unit.position,
    variant: 'monster',
    sound: 'summoner_skill',
    jobSounds: [{ job: 'summoner', kind: 'skill' }],
    durationMs: 1200,
    job: unit.job
  });
  state.log.push({ turn: state.turn, message: `${unit.name}はチャンピオンを召喚！（5ターン限定・HP15攻撃35）` });
}
export function processSkill(state, unit) {
  if (unit.hp <= 0) {
    // サモナー自身の死亡時は召喚効果を即時終了
    if (unit.memory.summonedChampion) {
      delete unit.memory.summonedChampion;
      state.log.push({ turn: state.turn, message: `${unit.name}の召喚効果が死亡により即時終了。` });
    }
    return;
  }
  // チャンピオン消滅・AI攻撃処理
  for (const u of state.units) {
    if (u.job === 'monster' && u.memory?.summonedChampion) {
      // ターン減算
      u.memory.summonedChampion.turns--;
      // 消滅条件
      if (u.memory.summonedChampion.turns <= 0 || u.hp <= 0) {
        queueEffect(state, {
          kind: 'smoke',
          position: u.position,
          source: u.position,
          variant: 'disappear',
          sound: 'monster_down',
          jobSounds: [{ job: 'monster', kind: 'down' }],
          durationMs: 800,
          job: 'monster'
        });
        state.log.push({ turn: state.turn, message: `チャンピオンは煙とともに消えた。` });
        u.hp = 0;
        // 実際の除去は外部でhp=0ユニットを除去する処理が走る想定
        continue;
      }
      // AI: 射程内の一番近い敵を攻撃
      const targets = getAttackableEnemies(state, u, u.stats.range );
      if (targets.length > 0) {
        // 最も近い敵
        const target = targets.reduce((a, b) => {
          const da = Math.hypot(a.position.x - u.position.x, a.position.y - u.position.y);
          const db = Math.hypot(b.position.x - u.position.x, b.position.y - u.position.y);
          return da < db ? a : b;
        });
        // 攻撃
        const damage = computeDamage(u, target);
        target.hp = Math.max(0, target.hp - damage);
        queueEffect(state, {
          kind: 'attack',
          position: target.position,
          source: u.position,
          target: target.position,
          variant: 'monster_attack',
          sound: 'monster_attack',
          jobSounds: [{ job: 'monster', kind: 'skill' }],
          impactLabel: `${damage}`,
          job: 'monster'
        });
        state.log.push({ turn: state.turn, message: `チャンピオンが${target.name}に${damage}ダメージ` });
      }
    }
  }
}
