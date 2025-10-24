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
    name: 'ユニット太郎',               // 画面に表示したい名前（未指定ならJOB名）
    initialPosition: {                 // 自陣の城からのオフセット指定
      relativeTo: 'allyCastle',        // 自城を基準にすることを明示
      forward: 3,                      // 敵方向へ3マス（東西どちらでも前進）
      lateral: -1                      // 上方向へ1マス（マップのYは下に行くほど増加）
      // x / y を併用すれば城座標に対する絶対オフセットも指定できます
    },
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
      const range = self.stats.range / 10;
      if (dist <= range) {
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
- キャラクターアイコン上部に表示される名前は `init` で返した `name` プロパティです。省略するとJOB名が表示されます。
- `init(context)` の `context` には `side` のほか `allyCastle`, `enemyCastle`, `mapSize` が含まれます。城位置を使って自分で絶対座標を計算することも可能です。
- `initialPosition` は `{ x, y }` で直接座標を指定する従来形式に加え、`{ relativeTo: 'allyCastle', forward: 3, lateral: -1 }` や `{ relativeTo: 'allyCastle', x: 3, y: -1 }` のように自城を原点としたオフセット指定ができます（`forward` は敵方向、`lateral` は下方向が正）。
- `state.enemyCastle` / `state.allyCastle` で各城のHPと座標が参照できます。敵城が射程内であれば `actions.attackCastle()` を返して直接ダメージを与えられます。
- `actions.moveToward(x, y)` の座標はマップ座標（整数）を想定していますが、補間移動のために小数が指定されても問題ありません。
- 運営側のテンプレートでは両陣営とも `teams/<side>/unit01.js` ～ `unit10.js` を読み込みます。提出ファイル名を同じ規則に合わせると差し替えが容易です。
- 指定できる `job` のキーは `soldier`, `lancer`, `archer`, `mage`, `healer`, `guardian`, `assassin`, `engineer`, `summoner`, `scout` の10種類です。スペルミスがあると試合開始時に弾かれます。