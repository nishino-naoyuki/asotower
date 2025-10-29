
# 学生向けプログラム仕様

## 1. やること
1. ユニット1体につき **JavaScriptファイル（unit01.js〜unit10.js）を1つ**作成する。
2. ファイルは `src/teams/west` または `src/teams/east` フォルダに配置する。
3. ファイル名は `unit01.js`〜`unit10.js` のいずれか（重複不可）。
4. ファイル内で `init`, `moveTo`, `attack` の3関数を必ずexportする。
5. `init`で `job`, `name`, `initialPosition`, `bonus`（合計10まで）などを設定する。

## 2. 必須テンプレート（コメント付きサンプル）
````javascript
// 自分のユニットを初期化する関数（試合開始時に1回だけ呼ばれる）
export function init(context) {
  return {
    job: 'archer',                      // 使用するJOB（doc/job.md参照）
    name: 'ユニット太郎',               // 画面に表示したい名前（未指定ならJOB名）
    initialPosition: {
      relativeTo: 'allyCastle', //自軍の城を基準とした位置で配置するという意味
      x: 3, //自軍の城からｘ方向にどれだけ離れた位置に配置するか（この例では３マス）
      y: -1 //自軍の城からy方向にどれだけ離れた位置に配置するか（この例ではー１マス）
    },
    // パラメーターボーナス（任意）
    // 合計10まで。job.mdの正式パラメータ名のみ有効
    bonus: {
      atk: 3,   // 攻撃力+3
      def: 2,   // 防御力+2
      spd: 2,   // 速度+2
      hit: 2,   // 命中+2
      hp: 1     // HP+1
      // 合計10まで。job.mdのパラメータ名以外は無効
    },
    memory: { lastTargetId: null }
  };
}

// どこに移動するか決める（最も近い敵がいればその座標、いなければ敵城）
export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
  // デフォルトは現在地
  var targetX = self.position.x;
  var targetY = self.position.y;

  if (enemies.length > 0) {
    // 最も近い敵の座標へ移動
    var nearest = utils.findNearest(self, enemies);
    targetX = nearest.position.x;
    targetY = nearest.position.y;
  } else if (enemyCastle && enemyCastle.position) {
    // 敵がいなければ敵城へ向かう
    targetX = enemyCastle.position.x;
    targetY = enemyCastle.position.y;
  }

  return { x: targetX, y: targetY };
}

// 攻撃対象と方法を決める
export function attack(turn, inRangeEnemies, self) {
  if (inRangeEnemies.length > 0) {
    var target = inRangeEnemies[0];
    // methodは"normal"で通常攻撃
    return { target: target, method: "normal" };
  }
  // 射程内に敵がいなければ攻撃しない
  return null;
}
````

## 3. 実装関数の説明

### init関数
**説明**
試合開始時に1回だけ呼ばれ、ユニットの初期設定（ジョブ・名前・初期位置・ボーナス・記憶領域など）を返す関数です。

**init関数の引数**

| 引数名   | 型      | 説明                                      |
|----------|--------|-------------------------------------------|
| context  | object | 試合開始時の情報（自城・敵城・マップサイズ等）|

**戻り値（オブジェクト）**
| キー              | 型      | 説明                                      |
|-------------------|--------|-------------------------------------------|
| job               | string | 使用するジョブ名（archer等）              |
| name              | string | ユニット表示名（任意）                    |
| initialPosition   | object | 初期配置座標（絶対座標またはオフセット）   |
| bonus             | object | パラメーターボーナス（合計10まで）         |
| memory            | object | ユニットごとの記憶領域（任意）            |

【パラメーターボーナスについて】
  - `init`関数の戻り値で `bonus` オブジェクトを指定すると、該当ユニットのステータスに加算されます。
  - 指定可能なキーは `doc/job.md` の正式パラメータ名（例: atk, def, spd, hit, hp, range など）です。
  - ボーナス値の合計は「最大10」まで。超過した場合は、そのユニットは戦闘に参加できません（エンジン・バリデータで除外されます）。
  - 不正なキー（job.mdに存在しないパラメータ名）は無効です。
  - ボーナス値は正の整数のみ有効です。未指定の場合はJOBの基本値のみが適用されます。
  - 詳細は `doc/job.md` を参照してください。


### moveTo関数
**説明**
毎ターン呼ばれ、ユニットが「どこに移動するかの目標」を決めるための関数です。敵や城の位置を見て移動先座標を返します。ユニットは目標座標にむかって速度パラメータの分移動します。

**moveTo関数の引数**

| 引数名         | 型        | 説明                                      |
|---------------|----------|-------------------------------------------|
| turn          | number   | 現在のターン数                            |
| enemies       | array    | 敵ユニットの配列                          |
| allies        | array    | 味方ユニットの配列                        |
| enemyCastle   | object   | 敵城の情報（座標・HPなど）                |
| allyCastle    | object   | 自城の情報（座標・HPなど）                |
| self          | object   | 自分自身の情報（座標・ステータスなど）    |

**戻り値（表形式解説）**

| キー | 型    | 説明                       |
|------|-------|----------------------------|
| x    | number| 移動先の目標x座標（マップ上）   |
| y    | number| 移動先の目標y座標（マップ上）   |

移動先の目標座標（x, y）をオブジェクトで返します。あくまで指定するのは目標の座標であり、指定した座標にワープするわけではありません。目標座標に向かってユニットごとに指定された速度分移動します


**戻り値の例**

> ※下記は「例」です。コピペしてもそのまま動くわけではありません。実際の座標値は状況に応じて変わります。

1. 敵ユニットの座標を目標として移動する場合（例：最も近い敵が変数nearestの場合）
```js
{ x: nearest.position.x, y: nearest.position.y }
```

2. 敵城の座標を目標として移動する場合
```js
{ x: enemyCastle.position.x, y: enemyCastle.position.y }
```

3. その場に留まる場合（移動しない）
```js
{ x: self.position.x, y: self.position.y }
```

---


### attack関数
**説明**
毎ターン呼ばれ、ユニットが「誰をどう攻撃するか」を決めるための関数です。射程内の敵や必殺技の使用可否を判定し、攻撃内容を返します。

**attack関数の引数**

| 引数名         | 型        | 説明                                      |
|---------------|----------|-------------------------------------------|
| turn          | number   | 現在のターン数                            |
| inRangeEnemies| array    | 射程内にいる敵ユニットの配列              |
| self          | object   | 自分自身の情報（座標・ステータスなど）    |

**戻り値（表形式解説）**

| キー      | 型      | 説明                                  |
|----------|--------|---------------------------------------|
| target   | object | 攻撃対象となる敵ユニットオブジェクト   |
| method   | string | 攻撃方法（"normal"=通常攻撃, "skill"=必殺技）|

攻撃しない場合は `null` を返します。

**戻り値の例（パターン）**

1. 通常攻撃する場合（攻撃対象の敵ユニットが変数enemyの場合）
```js
{ target: enemy, method: "normal" }
```

2. 必殺技（スキル）を使う場合（攻撃対象の敵ユニットが変数enemyの場合）
```js
{ target: enemy, method: "skill" }
```

3. 攻撃しない場合
```js
null
```

## 4. 補足メモ
- 射程は `stats.range / 10` マスとして判定されます。
- キャラクターアイコン上部に表示される名前は `init` で返した `name` プロパティです。省略するとJOB名が表示されます。
- `init(context)` の `context` には `side` のほか `allyCastle`, `enemyCastle`, `mapSize` が含まれます。城位置を使って自分で絶対座標を計算することも可能です。
- `initialPosition` は `{ x, y }` で直接座標を指定する従来形式に加え、`{ relativeTo: 'allyCastle', forward: 3, lateral: -1 }` や `{ relativeTo: 'allyCastle', x: 3, y: -1 }` のように自城を原点としたオフセット指定ができます（`forward` は敵方向、`lateral` は下方向が正）。
- `state.enemyCastle` / `state.allyCastle` で各城のHPと座標が参照できます。敵城が射程内であれば `actions.attackCastle()` を返して直接ダメージを与えられます。
- 1ターンに1回だけ「移動」「攻撃」できます。moveTo/attack関数はそれぞれ1つの行動を返してください。
- `utils.stepToward(from, to)` で次の移動先座標を取得し、エンジンが自動で移動します。
- 運営側のテンプレートでは両陣営とも `teams/<side>/unit01.js` ～ `unit10.js` を読み込みます。提出ファイル名を同じ規則に合わせると差し替えが容易です。
- ユニットファイルは `init`, `moveTo`, `attack` の3関数を必ずexportしてください。
- 【パラメーターボーナスについて】
  - `init`関数の戻り値で `bonus` オブジェクトを指定すると、該当ユニットのステータスに加算されます。
  - 例: `bonus: { attack: 5, speed: 2, hp: 20 }` の場合、元のJOBステータスにそれぞれ加算されます。
  - 指定可能なキーは `doc/job.md` のパラメータ名（attack, speed, hp, range, defense など）です。
  - ボーナス値は正の整数のみ有効です。未指定の場合はJOBの基本値のみが適用されます。
- 指定できる `job` のキーは `soldier`, `lancer`, `archer`, `mage`, `healer`, `guardian`, `assassin`, `engineer`, `summoner`, `scout` の10種類です。スペルミスがあると試合開始時に弾かれます。