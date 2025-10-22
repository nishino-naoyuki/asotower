# プログラム内部仕様書（運営・開発者向け）

## 1. 全体概要
- ブラウザ実行の純ES Modulesベース対戦型タワーディフェンス。
- 学生は1ユニット=1ファイルを所定フォルダに配置するのみで参加。
- 運営はフォルダへコピー → `team-map.json` 更新 → ブラウザで「戦闘開始」ボタンを押下。

## 2. ディレクトリ構成
```
/src
  ├─ index.html
  ├─ main.js
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
  │         ├─ bgm/
  │         └─ sfx/
  ├─ teams/
  │    ├─ west/
  │    └─ east/
  ├─ config/
  │    └─ team-map.json
  ├─ data/
  │    ├─ jobs.json
  │    └─ map.json
  └─ logs/
       └─ replays/
```

## 3. 起動・ビルド
- 依存なし。`python3 -m http.server 8000` などで `/public` を配信。
- `http://localhost:8000` へアクセスしてUI操作。

## 4. 試合開始フロー
1. `main.js` が `config/team-map.json` と `data/jobs.json` を読み込みUIへ反映。
2. 「戦闘開始」で `loadTeams()` が `teams/west|east` からボットを動的 import。
3. `sdk/validator.js` が `init`/`update` の存在と戻り値を検証。
4. 正常なら `engine/game-engine.js` の `startMatch()` が初期状態を生成しループ開始。

## 5. ゲームループ
- ターン制（1ターン=全ユニットの `update` 実行）。
- 処理順：行動順ソート → `update` 呼び出しでコマンド取得 → `actions.js` が解決 → `rules.js` でダメージ計算 → 状態更新 → ログ生成 → 勝敗判定。

## 6. 描画・UI
- `render/renderer.js` がCanvas更新、速度÷10で移動補間。
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
- ターン毎のスナップショットと行動ログをJSON記録。
- 試合終了時 `/logs/replays/` に `YYYYMMDD-HHMMSS.json` として保存しダウンロードリンク提示。

## 10. 入力ファイル管理
| 値 | 説明 | 設定例 |
| --- | --- | --- |
| `config/team-map.json.west[]/east[]` | チームスロット配列。各要素にファイル名・JOB・初期座標を定義。 | `{"slot":1,"file":"unit01.js","job":"guardian","initialPosition":{"x":4,"y":5}}` |
| `config/team-map.json.maxUnits` | チーム編成人数。既定は10。 | `10` |
| `data/jobs.json["archer"].stats.attack` | JOB別ステータス。`doc/job.md` と一致する値を管理。 | `26` |
| `data/jobs.json["archer"].skill` | スキル種類・効果量を定義。 | `{"name":"multiShot","power":0.7,"targets":3}` |
| `data/map.json.width / height` | マップサイズ（マス数）。 | `40`, `18` |
| `data/map.json.walls[]` | 壁の配置と耐久値。 | `{"x":20,"y":8,"hp":300}` |
| `data/map.json.castles.westHp/eastHp` | 城の初期HP。 | `2000` |
| `assets/audio/audio-manifest.json` (任意) | BGM/SFX のファイル名と用途を列挙。 | `{"bgm":["main_theme.mp3"],"sfx":{"attack":"hit.wav"}}` |

- `init` で返す `job`・`initialPosition` が設定値と不一致の場合はUIで警告。
- `teams/west|east` へのファイルコピーのみで参加登録完了。

## 11. 追加タスク案
- 乱数シード入力UI。
- `scripts/smoke-test.html` 等による自動整合テスト。
- 評価指標出力（城ダメージ、撃破数など）。

## 12. 学生向け仕様との整合
- `doc/job.md` のステータス・スキル値・速度÷10計算をエンジンが参照。
- `doc/program.md`（学生向け）で公開しているAPI仕様は `sdk/api.js` と常に同期。

## 13. アセット配置
- 画像は `/public/assets/images/` 以下に用途別格納。
- 画像は `/public/assets/images/` 以下に用途別格納。
  - `castle/`：自軍・敵軍城スプライト（損傷段階差分があれば演出に使用）。
  - `jobs/`：各JOBアイコン（通常・スキル発動時などバリエーション）。
  - `map/`：床タイル、壁テクスチャ、通路、障害物など。
  - `effects/`：スキルエフェクト、攻撃ヒットなどの演出素材。
  - `ui/`：ボタン、HPバー、ステータス表示などUI用画像。
- 任意追加：投射物アイコンなど追加エフェクトを `effects/` に配置。
- 音声は `/public/assets/audio/` に配置。
  - `bgm/`：試合BGM。`audio-manager.js`（仮）でループ再生管理。
  - `sfx/`：効果音（攻撃、スキル、勝敗、UI操作など）。
  - 追加が必要な場合は `audio-manifest.json` でファイル名と用途を定義し、プリロードを共通化。
- `render/renderer.js` および `audio-manager.js` でプリロード管理し、試合開始前に読み込み完了を待つ。

## 14. 配置・登録制限
- 初期配置座標は自軍陣地20マス以内（西軍: x0–19、東軍: x20–39）に限定。
- 初期配置マスはユニット間で重複不可。`validator` でマップ重複チェックを実施。
- チーム人数は既定10人（`config/team-map.json.maxUnits` で変更可）。不足・超過は試合開始前に警告してブロック。
- 各ユニットファイルは一意のファイル名と `init` / `update` の必須実装が必要。
- `init` で宣言したJOBは `jobs.json` に存在するもののみ有効。未定義JOBは試合開始を停止し警告。
- スキルはエンジン側で1試合につき1回のみ許可し、複数回返された場合は無効化してログに記録。