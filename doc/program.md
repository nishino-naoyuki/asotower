# プログラム内部仕様書（運営・開発者向け）

## 1. 全体概要
- ブラウザ実行の純ES Modulesベース対戦型タワーディフェンス。
- 学生は1ユニット=1ファイルを所定フォルダに配置するのみで参加。
- 運営はフォルダへコピー → `team-map.json` 更新 → ブラウザで「戦闘開始」ボタンを押下。

## 2. ディレクトリ構成
```
README.md
doc/
src/

/src
  ├─ index.html              … エントリーポイント
  ├─ main.js                 … 初期化＆UI結線
  ├─ styles.css              … 画面全体のスタイル
  ├─ engine/
  │    ├─ game-engine.js
  │    ├─ state.js
  │    ├─ rules.js
  │    └─ actions.js
  ├─ render/
  │    ├─ renderer.js
  │    ├─ ui-overlay.js
  │    ├─ controls.js
  │    ├─ audio-manager.js
  │    └─ replay-recorder.js
  ├─ sdk/
  │    ├─ api.js
  │    ├─ sandbox.js
  │    └─ validator.js
  ├─ assets/
  │    ├─ images/
  │    │    ├─ castle/
  │    │    ├─ jobs/
  │    │    ├─ map/
  │    │    ├─ effects/
  │    │    └─ ui/
  │    └─ audio/
  │         ├─ audio-manifest.json
  │         ├─ bgm/
  │         ├─ jobs/
  │         └─ sfx/
  ├─ teams/
  │    ├─ west/
  │    └─ east/
  ├─ config/
  │    └─ team-map.json
  └─ data/
    ├─ jobs.js / jobs.json
    └─ map.js / map.json
```

## 3. 起動・ビルド
- 依存なし。リポジトリ直下で `python3 -m http.server --directory src 8000` を実行し `/src` を配信。
- Codespaces 等では自動転送されたポート (例: `https://<workspace>-8000.preview.app.github.dev/`) へアクセス。

## 4. 試合開始フロー
1. `main.js` が `sdk/api.js` 経由で `config/team-map.json`・`data/jobs.js`・`data/map.js` を読み込みUIへ反映。
2. 「戦闘開始」で `loadTeams()` が `teams/west|east` からボットを動的 import（全ファイル名は `unitXX.js` に統一）。
3. `sdk/validator.js` が `init`/`update` の存在と戻り値を検証。
4. 正常なら `engine/game-engine.js` の `startMatch()` が初期状態を生成しループ開始。

## 5. ゲームループ
- ターン制（1ターン=全ユニットの `update` 実行）。
- 処理順：行動順ソート → `update` 呼び出しでコマンド取得 → `actions.js` が解決 → `rules.js` でダメージ計算 → 状態更新 → ログ生成 → 勝敗判定。

## 6. 描画・UI
- `render/renderer.js` が Canvas を更新。攻撃は軌跡・ヒットエフェクト・城攻撃演出を描画。
- `ui-overlay.js` が右パネル・ログ更新、`controls.js` が再生/停止・ステップ・速度操作とリプレイ制御。
- 画面構成は `doc/display.md` に準拠。

## 7. SDK API
- `actions.moveToward(x, y)`：速度÷10を適用して目的地へ移動。
- `actions.attack(target)`：射程チェック後攻撃。
- `actions.useSkill(target?)`：試合1回のみ。
- `utils.findClosest(list, origin)`、`utils.distance(a, b)`、`utils.inRange(self, enemy)`、`utils.stepToward(from, to)` 等を提供。
- `state.memory` は `init` が返したメモリ参照で `update` 内から更新可能。

## 8. サンドボックス・安全対策
- `sdk/sandbox.js` で危険API禁止、ホワイトリストimportのみ許可。
- `validator.js` がグローバル汚染や未定義戻り値を検知。
- `update` 実行にはタイムアウトを設け、無限ループを防止。

## 9. ログ・リプレイ
- ターン毎のログはブラウザ内メモリに保持し、オーバーレイに表示。
- ファイルへの恒久保存やダウンロード出力は未実装（`ReplayRecorder` の骨組みのみ存在）。

## 10. 入力ファイル管理
| 値 | 説明 | 設定例 |
| --- | --- | --- |
| `config/team-map.json.west[]/east[]` | チームスロット配列。ファイル名はすべて `unitXX.js` 形式。 | `{"slot":1,"file":"unit01.js","job":"guardian","initialPosition":{"x":4,"y":5}}` |
| `config/team-map.json.maxUnits` | チーム編成人数。既定は10。 | `10` |
| `data/jobs.js["archer"].stats.attack` | JOB別ステータス。`doc/job.md` と一致。 | `26` |
| `data/jobs.js["archer"].skill` | スキルデータ。 | `{"name":"multiShot"}` |
| `data/map.js.width / height` | マップサイズ（マス数）。 | `30`, `15` |
| `data/map.js.walls[]` | 壁の配置と耐久値。 | `{"x":19,"y":7,"hp":300}` |
| `data/map.js.castles.westHp/eastHp` | 城の初期HP。 | `200` |
| `assets/audio/audio-manifest.json.bgm` | BGMを key-value またはオブジェクト（`{path, loop, volume}`）で定義。 | `"main": {"path":"bgm/main_theme.mp3","loop":true}` |
| `assets/audio/audio-manifest.json.jobs` | JOB固有の被弾/撃破サウンドを定義（HEADで存在確認済みのみ再生）。 | `"soldier": {"hit":"jobs/soldier_hit.mp3"}` |

- `init` で返す `job`・`initialPosition` が設定値と不一致の場合はUIで警告。
- `teams/west|east` へのファイルコピーのみで参加登録完了。

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