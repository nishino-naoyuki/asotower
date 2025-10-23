# 学生向けプログラム仕様

## 1. やること
1. ユニット1体につき **JavaScriptファイルを1つ** 作る。
2. 運営指定の `teams/west` か `teams/east` フォルダにコピーする。
3. ファイル内で `init` と `update` 関数を **必ず** `export` する。

## 2. 必須テンプレート（コメント付きサンプル）
````javascript
// 自分のユニットを初期化する関数（試合開始時に1回だけ呼ばれる）
export function init(context) {
  return {
    job: 'archer',                      // 使用するJOB（doc/job.md参照）
    initialPosition: { x: 5, y: 6 },    // 初期位置（マップ上のマス座標）
    memory: { lastTargetId: null }      // 状態を保存しておけるメモリ（任意）
  };
}

// 毎ターン呼ばれる関数。ここで行動を決めて return する
export function update(state, api) {
  const { self, enemies } = state;      // 自分と敵の情報を取り出す
  const { actions, utils } = api;       // 行動関数・便利関数をまとめて取得

  // 最も近い敵を探す（utils.findClosestはfor文の代わりになる関数）
  const target = utils.findClosest(enemies, self.position);

  // 敵が見えなければ中央方向へ前進（いなければ城を攻撃）
  if (!target) {
    const castle = state.enemyCastle;
    if (castle?.position) {
      const dist = utils.distance(self.position, castle.position);
      if (dist <= self.stats.range) {
        return actions.attackCastle();
      }
      return actions.moveToward(castle.position.x, castle.position.y);
    }
    return actions.moveToward(20, self.position.y);
  }

  // 射程内なら攻撃
  if (utils.inRange(self, target)) {
    state.memory.lastTargetId = target.id;  // メモリにターゲットIDを保存
    return actions.attack(target);
  }

  // 射程外なら1ステップずつ近づく
  const nextStep = utils.stepToward(self.position, target.position);
  return actions.moveToward(nextStep.x, nextStep.y);
}
````

## 3. 補足メモ
- 射程は `stats.range / 10` マスとして判定されます。表示される値と合わせて行動ロジックを調整してください。
- `state.enemyCastle` / `state.allyCastle` で各城のHPと座標が参照できます。敵城が射程内であれば `actions.attackCastle()` を返して直接ダメージを与えられます。
- `actions.moveToward(x, y)` の座標はマップ座標（整数）を想定していますが、補間移動のために小数が指定されても問題ありません。