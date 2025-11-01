// サモナー: ミニオンコール（HP40攻撃10のミニオン3体を20秒間召喚）
import { queueEffect } from '../actions.js';
import * as uutils from '../../shared/unit-utils.js';

// チャンピオン消滅共通処理
function vanishChampion(state, champ) {
  if (!champ) return;
  queueEffect(state, {
    kind: 'smoke',
    position: champ.position,
    source: champ.position,
    variant: 'disappear',
    sound: 'monster_down',
    jobSounds: [{ job: 'monster', kind: 'down' }],
    durationMs: 800,
    job: 'monster'
  });
  champ.hp = 0;
}

// チャンピオンを通常ユニットと同じように扱うため、簡易AIモジュールを付与する。
// moveTo: 敵がいれば最寄りの敵へ、いなければ敵城へ移動
// attack: 射程内の敵がいれば通常攻撃を返す
// ヘルパーを使って見通し良くする
function chooseChampionMoveTarget(enemies, enemyCastle, self) {
  if (enemies && enemies.length > 0) {
    const nearest = uutils.findNearest(self, enemies);
    if (nearest) return { x: nearest.position.x, y: nearest.position.y };
  }
  const castlePos = uutils.getEnemyCastlePosition(self) || enemyCastle;
  if (castlePos) return { x: castlePos.x, y: castlePos.y };
  return { x: self.position.x, y: self.position.y };
}

function chooseChampionAttackTarget(inRangeEnemies, self) {
  if (!inRangeEnemies || inRangeEnemies.length === 0) return null;
  const nearest = uutils.findNearest(self, inRangeEnemies);
  return nearest ? { target: nearest, method: 'normal' } : null;
}

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
      hp: 40,
      attack: 40,
      speed: 30,
      range: 30,
      vision: 15,
      defense: 40
    },
    hp: 40,
    // summonedChampion.turns は残存ターン数（生成直後を含め5ターン分稼働させたい）
    memory: { summonedChampion: { turns: 5 } }
  };

  champion.module = {
    moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
      return chooseChampionMoveTarget(enemies, enemyCastle, self);
    },
    attack(turn, inRangeEnemies, self) {
      return chooseChampionAttackTarget(inRangeEnemies, self);
    }
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
      // 召喚したチャンピオンを探して消す
      const champId = unit.memory.summonedChampion;
      const champ = state.units.find(u => u.id === champId);
      if (champ) {
        vanishChampion(state, champ);
      }
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
        vanishChampion(state, u);
        state.log.push({ turn: state.turn, message: `チャンピオンは煙とともに消えた。` });
        // 実際の除去は外部でhp=0ユニットを除去する処理が走る想定
        continue;
      }
      // 動作は標準のターン処理（createTurnProcessor 内の moveTo / attack 呼び出し）に任せる。
    }
  }
}
