---

## 汎用関数（src/shared/unit-utils.js）
ユニットAIやゲームエンジンで利用可能な汎用関数群。AI開発・ロジック実装時に活用できます。

### distanceBetween(a, b)
- 概要: 2点間の距離（タイル単位）を計算。座標オブジェクト {x, y} を受け取り、ユークリッド距離を返す。
- 引数: a, b（座標オブジェクト）
- 戻り値: 距離（数値）
- 使用例: `distanceBetween(self.position, enemy.position)`
- ロジック: `Math.sqrt(dx*dx + dy*dy)` で計算。障害物や壁は考慮しない。

### findNearest(self, units)
- 概要: 配列から最も近いユニットを取得。自分の座標と各ユニットの座標を比較。
- 引数: self（自分のユニット）、units（ユニット配列）
- 戻り値: 最も近いユニット（オブジェクト）
- 使用例: `findNearest(self, enemies)`
- ロジック: 距離が最小のユニットを線形探索で返す。

### findFarthestEnemyPosition(self, enemies)
- 概要: 自分から最も遠い敵の座標を取得。
- 引数: self（自分のユニット）、enemies（敵ユニット配列）
- 戻り値: 座標オブジェクト {x, y} または null
- 使用例: `findFarthestEnemyPosition(self, enemies)`
- ロジック: 距離が最大の敵ユニットを探索し、その座標を返す。

### getEnemyCastlePosition(self, map)
- 概要: 敵の城の座標を取得。
- 引数: self（自分のユニット）、map（マップ情報）
- 戻り値: 座標オブジェクト {x, y} または null
- 使用例: `getEnemyCastlePosition(self, map)`
- ロジック: 自軍sideから敵sideを判定し、map.castlesから座標を取得。

### hasUsedSkill(unit)
- 概要: 指定ユニットが必殺技（スキル）を使ったか判定。
- 引数: unit（ユニットオブジェクト）
- 戻り値: true/false
- 使用例: `hasUsedSkill(self)`
- ロジック: unit.skill.usedフラグを参照。

### getUnitPosition(unit)
- 概要: ユニットの現在座標を取得。
- 引数: unit（ユニットオブジェクト）
- 戻り値: 座標オブジェクト {x, y} または null
- 使用例: `getUnitPosition(self)`
- ロジック: unit.positionプロパティを返す。

### getUnitHp(unit)
- 概要: ユニットの残りHPを取得。
- 引数: unit（ユニットオブジェクト）
- 戻り値: HP（数値）
- 使用例: `getUnitHp(self)`
- ロジック: unit.hpプロパティを返す。

### getUnitJob(unit)
- 概要: ユニットのジョブ名を取得。
- 引数: unit（ユニットオブジェクト）
- 戻り値: ジョブ名（文字列）
- 使用例: `getUnitJob(self)`
- ロジック: unit.jobプロパティを返す。

### getUnitsByJob(units, jobName)
- 概要: ユニット配列から指定ジョブのユニットを抽出。
- 引数: units（ユニット配列）、jobName（ジョブ名）
- 戻り値: 条件に合うユニット配列
- 使用例: `getUnitsByJob(enemies, "healer")`
- ロジック: filterでjobプロパティ一致ユニットのみ抽出。

---
# プログラム内部仕様書（運営・開発者向け）

## 1. 全体概要
- ブラウザ実行の純ES Modulesベース対戦型タワーディフェンス。
- 学生は1ユニット=1ファイルを所定フォルダに配置するのみで参加。
- 運営はフォルダへコピー → `team-map.json` 更新 → ブラウザで「戦闘開始」ボタンを押下。

## 2. ディレクトリ構成（2025年10月現在）

### 主なjs/jsonファイルの役割一覧

| ファイルパス | 種類 | 説明 |
|---|---|---|
| src/main.js | js | アプリ全体の初期化・UI結線 |
| src/styles.css | css | 画面全体のスタイル定義 |
| src/config/asset-manifest.json | json | 画像・音声などアセットの一覧管理 |
| src/config/team-map.json | json | チーム編成・ユニット配置情報 |
| src/data/jobs.js | js | ジョブごとのステータス・スキル定義 |
| src/data/map.js | js | マップサイズ・城・壁などの定義 |
| src/engine/actions.js | js | ユニットの行動（移動・攻撃等）処理 |
| src/engine/game-engine.js | js | ゲーム全体の進行・ループ管理 |
| src/engine/rules.js | js | ダメージ計算・射程判定などルール処理 |
| src/engine/state.js | js | ゲーム状態管理（ユニット・城・ターン等） |
| src/engine/jobs/*.js | js | 各ジョブのスキル・特殊処理 |
| src/render/renderer.js | js | Canvas描画・バトル画面表示 |
| src/render/ui-overlay.js | js | サイドパネル・ログ・ユニット詳細表示 |
| src/render/controls.js | js | 再生/停止/ステップ等の操作UI |
| src/render/asset-loader.js | js | 画像・音声アセットのプリロード |
| src/render/audio-manager.js | js | 音声再生・BGM/SE管理 |
| src/render/replay-recorder.js | js | リプレイ記録（未実装） |
| src/sdk/api.js | js | ゲームAPI・外部連携 |
| src/sdk/sandbox.js | js | サンドボックス実行・安全対策 |
| src/sdk/validator.js | js | ユニットファイルの検証・警告 |
| src/shared/unit-position.js | js | 初期配置座標の計算ロジック |
| src/shared/unit-utils.js | js | ユニット操作の便利関数群 |
| src/assets/audio/audio-manifest.json | json | 音声アセット一覧・設定 |
| src/teams/east/unit01.js〜unit10.js | js | 東軍ユニットAI（各自作成） |
| src/teams/west/unit01.js〜unit10.js | js | 西軍ユニットAI（各自作成） |
```
README.md
doc/
src/
  ├─ index.html
  ├─ main.js
  ├─ styles.css
  ├─ assets/
  │    ├─ images/
  │    │    ├─ castle/
  │    │    ├─ jobs/
  │    │    ├─ map/
  │    │    ├─ sfx/
  │    │    └─ ui/
  │    └─ audio/
  │         ├─ audio-manifest.json
  │         ├─ bgm/
  │         ├─ jobs/
  │         └─ sfx/
  ├─ config/
  │    ├─ asset-manifest.json
  │    └─ team-map.json
  ├─ data/
  │    ├─ jobs.js
  │    └─ map.js
  ├─ engine/
  │    ├─ actions.js
  │    ├─ game-engine.js
  │    ├─ rules.js
  │    ├─ state.js
  │    └─ jobs/
  │         ├─ archer.js
  │         ├─ assassin.js
  │         ├─ engineer.js
  │         ├─ guardian.js
  │         ├─ healer.js
  │         ├─ index.js
  │         ├─ lancer.js
  │         ├─ mage.js
  │         ├─ scout.js
  │         ├─ soldier.js
  │         ├─ summoner.js
  │         ├─ sumo.js
  ├─ render/
  │    ├─ asset-loader.js
  │    ├─ audio-manager.js
  │    ├─ controls.js
  │    ├─ renderer.js
  │    ├─ replay-recorder.js
  │    └─ ui-overlay.js
  ├─ sdk/
  │    ├─ api.js
  │    ├─ sandbox.js
  │    └─ validator.js
  ├─ shared/
  │    ├─ unit-position.js
  │    └─ unit-utils.js
  ├─ teams/
  │    ├─ east/
  │    │    ├─ unit01.js
  │    │    ├─ unit02.js
  │    │    ├─ unit03.js
  │    │    ├─ unit04.js
  │    │    ├─ unit05.js
  │    │    ├─ unit06.js
  │    │    ├─ unit07.js
  │    │    ├─ unit08.js
  │    │    ├─ unit09.js
  │    │    └─ unit10.js
  │    └─ west/
  │         ├─ unit01.js
  │         ├─ unit02.js
  │         ├─ unit03.js
  │         ├─ unit04.js
  │         ├─ unit05.js
  │         ├─ unit06.js
  │         ├─ unit07.js
  │         ├─ unit08.js
  │         ├─ unit09.js
  │         └─ unit10.js
```


## 3. 起動・ビルド
以下のいずれかの方法で起動できます（両方を実行する必要はありません）。

**方法A: Python簡易サーバー**
- リポジトリ直下で `python3 -m http.server --directory src 8000` を実行し `/src` を配信。
- Codespaces等では自動転送されたポート (例: `https://<workspace>-8000.preview.app.github.dev/`) へアクセス。

**方法B: VS Code Live Server**
- VS Code でリポジトリを開き、拡張機能「Live Server」（Ritwick Dey）を導入。
- `src/index.html` を右クリックし **Open with Live Server** を選択し、`http://127.0.0.1:5500/src/index.html` へアクセス。

## 4. 試合開始フロー
1. `main.js` が `sdk/api.js` 経由で `config/team-map.json`・`data/jobs.js`・`data/map.js` を読み込みUIへ反映。
2. 「戦闘開始」で `loadTeams()` が `teams/west|east` からボットを動的 import（全ファイル名は `unitXX.js` に統一）。
3. `sdk/validator.js` が `init`, `moveTo`, `attack` の存在と戻り値を検証。ボーナス合計10超過や配置重複は警告・除外。
4. 正常なら `engine/game-engine.js` の `startMatch()` が初期状態を生成しループ開始。
5. `init` が返す `name` はユニット表示名として保持し、未指定時はJOBキーを利用。
6. `init` の `initialPosition` は「自軍城基準」が原則（forward/lateral/x/y指定）。x/yのみ指定時は絶対座標。


## 5. ゲームループ
- ターン制（1ターン=全ユニットのAIコマンド実行）。
- 毎ターン、`createTurnProcessor` により行動順（速度降順→スロット昇順）でユニットを処理。
- 各ユニットについて：
  1. ジョブごとの `processSkill` を呼び出し（パッシブ効果等）。
  2. 各ユニットのmoveTo、attackメソッドを呼び出して行動を決定する。
  3. コマンド種別（移動・攻撃・スキル・城攻撃）に応じて `actions.js` で実行。
  4. 移動は壁・混雑判定、攻撃は射程・ダメージ計算（`rules.js`）、スキルはジョブごとのdoSkill。
  5. 実行結果に応じてエフェクト（攻撃軌跡・ヒット・撃破・城陥落等）を `queueEffect` で登録。
  6. ログ（移動・攻撃・スキル・失敗・エラー等）を記録。
- 全ユニット処理後、ターン数を進め、勝敗判定（城HP0で終了、引き分け判定あり）。
- エフェクトはターン進行と並行して描画・音声再生。

## 6. 描画・UI
- `render/renderer.js` が Canvas を更新。攻撃は軌跡・ヒットエフェクト・城攻撃演出を描画。
- `ui-overlay.js` が右パネル（ユニット詳細）・ログ更新、`controls.js` が再生/停止・ステップ・速度操作とリプレイ制御。
- ユニットをクリックするとサイドパネルに詳細情報（JOB、HP、座標、ボーナス加算後ステータス等）が表示される。
- 画面構成は `doc/display.md` に準拠。
- コピペ例やサンプルコードはそのまま動かない場合がある旨を注意書きで表示。


## 7. SDK API（AIユニット用）
- ユニットAIは `moveTo`, `attack`, `init` などの関数を実装。
- コマンド生成時、以下のAPIが利用可能：
  - `actions.moveToward(x, y)`：速度÷10で目的地へ移動（壁・混雑判定あり）。
  - `actions.attack(target)`：射程内の敵ユニットへ攻撃。
  - `actions.attackCastle()`：射程内の敵城へ攻撃。
  - `actions.useSkill(target?)`：スキル発動（試合1回のみ、ジョブごとにdoSkill実装）。
- 補助関数（`utils`）:
  - `findClosest(list, origin)`：最も近いユニット/座標を取得。
  - `distance(a, b)`：2点間の距離（ユークリッド距離）。
  - `distanceBetween(a, b)`：2点間の距離（タイル単位、`unit-utils.js` 実装）。
  - `findNearest(self, units)`：自分から最も近いユニットを取得（`unit-utils.js` 実装）。
  - `inRange(self, enemy)`：射程判定。
  - `stepToward(from, to)`：1ステップ分だけ目標方向へ座標を進める。
  - `closestEnemy(view)` / `closestAlly(view)`：最寄りの敵/味方ユニット取得。
  - `distanceToEnemyCastle(view)` / `distanceToAllyCastle(view)`：城までの距離。
  - `remainingEnemies(view)` / `remainingAllies(view)`：残存ユニット数。
  - その他、`src/shared/unit-utils.js` に追加した汎用関数も利用可能。
- `state.memory` は `init` で返したオブジェクトを参照・更新可能（ターン間で情報保持）。
- `update`/`moveTo`/`attack` などのAI関数は毎ターン呼ばれ、コマンドを返す。
- スキルは `actions.useSkill` で発動し、ジョブごとのdoSkillで効果・エフェクトを実装。
- 注意：API仕様は `doc/forstudent.md` と常に同期。サンプルコードはバージョン差異に注意。

## 8. サンドボックス・安全対策
- `sdk/sandbox.js` で危険API禁止、ホワイトリストimportのみ許可。
- `validator.js` がグローバル汚染や未定義戻り値を検知。
- `update` 実行にはタイムアウトを設け、無限ループを防止。

## 9. ログ・リプレイ
- ターン毎のログはブラウザ内メモリに保持し、オーバーレイに表示。
- イベントログには攻撃結果、スキル使用、移動失敗、城/壁ダメージ、エラー、バリデータ警告（ボーナス超過・配置重複など）も表示。
- ファイルへの恒久保存やダウンロード出力は未実装（`ReplayRecorder` の骨組みのみ存在）。


## 10. 入力ファイル管理

### src/config/team-map.json
| 値 | 説明 | 設定例 |
| --- | --- | --- |
| maxUnits | チーム編成人数（既定10） | 10 |
| turnIntervalMs | 1ターンの間隔（ms） | 500 |
| unitActionIntervalMs | ユニットごとの行動間隔（ms） | 1000 |
| tileSize | 1マスのピクセルサイズ | 64 |
| west[]/east[] | チームスロット配列（ファイル名・ジョブ・初期配置） | { "slot": 1, "file": "unit01.js", "job": "guardian", "initialPosition": { "x": 0, "y": 0 } } |

### src/config/asset-manifest.json
| 値 | 説明 | 設定例 |
| --- | --- | --- |
| basePath | 画像アセットの基準パス | "./assets/images" |
| castles.west/east.default/damaged | 城画像（通常/損傷） | "castle/fort_west.png" |
| map.ground/path/magefire/wall.intact/damaged | マップ・壁画像 | "map/ground.png" |
| effects.skill_flash/impact | エフェクト画像 | "sfx/skill_flash.png" |
| ui.button.play/pause/step | UIボタン画像 | "ui/button_play.png" |
| ui.hp_bar.bg/fill | HPバー画像 | "ui/hp_bar_bg.png" |
| ui.skill_icon | スキルアイコン画像 | "ui/skill_icon.png" |
| jobs.<job>.default/attack/skill/win | ジョブごとのアイコン・演出画像 | "jobs/soldier.png" |

### src/assets/audio/audio-manifest.json
| 値 | 説明 | 設定例 |
| --- | --- | --- |
| bgm.<key>.path | BGMファイルパス | "bgm/main_theme.mp3" |
| bgm.<key>.loop | BGMループ再生フラグ | true |
| sfx.<key> | 汎用効果音ファイルパス | "sfx/impact.mp3" |
| jobs.<job>.hit/down | ジョブごとの被弾/撃破サウンド | "jobs/soldier_hit.mp3" |

## 11. 追加タスク案
- 乱数シード入力UI。
- `scripts/smoke-test.html` 等による自動整合テスト。
- 評価指標出力（城ダメージ、撃破数など）。

## 12. 学生向け仕様との整合
- `doc/job.md` のステータス・スキル値・速度÷10計算をエンジンが参照。
- `doc/forstudent.md` で公開しているAPI仕様は `sdk/api.js` と常に同期。

## 13. アセット配置
- 画像は `src/assets/images/` 以下に用途別格納。
  - `castle/`：自軍・敵軍城スプライト（損傷段階差分があれば演出に使用）。
  - `jobs/`：各JOBアイコン（通常・スキル発動時などバリエーション）。
  - `map/`：床タイル、壁テクスチャ、通路、障害物など。
  - `effects/`：スキルエフェクト、攻撃ヒットなどの演出素材。
  - `ui/`：ボタン、HPバー、ステータス表示などUI用画像。
- 任意追加：投射物アイコンなど追加エフェクトを `effects/` に配置。
- 音声は `src/assets/audio/` に配置。
  - `bgm/`：試合BGM。`audio-manifest.json` の `loop` フラグで単発／ループを制御。
  - `sfx/`：攻撃・スキルなど汎用効果音。`hit_default` などのデフォルトキーを必ず定義。
  - `jobs/`：ジョブ固有の被弾/撃破サウンド。存在チェック後に再生される。
  - 追加が必要な場合は `audio-manifest.json` にキーを追記し、`audio-manager.js` がプリロード。
- `render/renderer.js` および `audio-manager.js` でプリロード管理し、試合開始前に読み込み完了を待つ。

## 14. 配置・登録制限
- 初期配置座標は自軍陣地20マス以内（西軍: x0–19、東軍: x20–39）に限定。
- 初期配置マスはユニット間で重複不可。`validator` とエンジンが衝突を検知。
- チーム人数は既定10人（`config/team-map.json.maxUnits` で変更可）。不足・超過は試合開始前に警告してブロック。
- 各ユニットファイルは一意のファイル名と `init` / `update` の必須実装が必要。
- `init` で宣言したJOBは `jobs.json` に存在するもののみ有効。未定義JOBは試合開始を停止し警告。
- スキルはエンジン側で1試合につき1回のみ許可し、複数回返された場合は無効化してログに記録。