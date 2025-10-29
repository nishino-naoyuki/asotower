

# asotower

## 目次
- [このプログラムが何のプログラムかの概要](#このプログラムが何のプログラムかの概要)
- [プログラムの実行方法](#プログラムの実行方法)
- [プログラムのフォルダ構成](#プログラムのフォルダ構成)
- [学生がプログラムをどう組めばいいかの解説](#学生がプログラムをどう組めばいいかの解説)
- [各仕様書へのリンク](#各仕様書へのリンク)

## このプログラムが何のプログラムかの概要
純ES Modules・ブラウザ実行型の対戦型タワーディフェンスゲーム。運営は両陣営のユニットAIと設定ファイルを用意し、学生はSDK/APIを使って自チームのAIファイルを作成・提出。ブラウザ上で戦闘・リプレイ観戦が可能。

## プログラムの実行方法
### 方法A: Python簡易サーバー
1. リポジトリ直下で以下を実行：
	 ```bash
	 python3 -m http.server --directory src 8000
	 ```
2. `http://localhost:8000`（Codespacesは転送URL）へアクセス。
3. UIでチーム編成を確認し「戦闘開始」を押す。

### 方法B: VS Code Live Server
1. VS Codeで本リポジトリを開く。
2. 拡張機能「Live Server」（Ritwick Dey）をインストール。
3. `src/index.html` を右クリック→**Open with Live Server**。
4. ブラウザで `http://127.0.0.1:5500/src/index.html` を開く。
5. 画面で「戦闘開始」を押す。

## プログラムのフォルダ構成
```text
src/
	index.html            ブラウザエントリーポイント
	main.js               初期化・UI制御
	engine/               ゲーム進行・ルール
	render/               描画・UI・エフェクト
	sdk/                  学生向けAPI・サンドボックス
	teams/                西軍・東軍のAIファイル
	config/               チーム編成・アセット設定
	data/                 ジョブ・マップ定義
	assets/               画像・音声アセット
```

## 学生がプログラムをどう組めばいいかの解説
- 1ユニット=1ファイル（`teams/west`または`teams/east`に配置）。
- 必須エクスポート：`init()`（初期化）、`moveTo()`（移動）、`attack()`（攻撃）。
- `init`で`job`（`data/jobs.js`定義）、`initialPosition`（castle基準または絶対座標）、`memory`、`bonus`、`name`等を返す。
- `moveTo`は毎ターン呼ばれ、移動先座標を返す。
- `attack`は毎ターン呼ばれ、攻撃対象・方法を返す。
- ユーティリティは`shared/unit-utils.js`経由で利用可能。

### 最小テンプレート例（unit01.js参考）
```javascript
import * as utils from "../../shared/unit-utils.js";

export function init() {
	return {
		job: "assassin",
		name: "ユニットの表示名",
		initialPosition: {
			relativeTo: "allyCastle",
			x: 13,
			y: 1
		},
		memory: {},
		bonus: { atk: 3, def: 2, spd: 2, hit: 2, hp: 1 }, // 合計10
	};
}

export function moveTo(turn, enemies, allies, enemyCastle, allyCastle, self) {
	var targetX = self.position.x;
	var targetY = self.position.y;

	if (enemies.length > 0) {
		var nearest = utils.findNearest(self, enemies);
		targetX = nearest.position.x;
		targetY = nearest.position.y;
	} else if (enemyCastle && enemyCastle.position) {
		targetX = enemyCastle.position.x;
		targetY = enemyCastle.position.y;
	}

	return { x: targetX, y: targetY };
}

export function attack(turn, inRangeEnemies, self) {
	if (inRangeEnemies.length > 0) {
		var target = inRangeEnemies[0];
		return { target: target, method: "normal" };
	}
	return null;
}
```

## 各仕様書へのリンク
- [運営・開発者向け仕様書](doc/program.md)
- [学生向けプログラム仕様](doc/forstudent.md)
- [画面構成ガイド](doc/display.md)
- [ジョブ一覧・詳細](doc/job.md)
- [アセット一覧](doc/imagelist.md)
- [機能リスト](doc/feature_list.md)