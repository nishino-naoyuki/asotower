# asotower

## 目次
- [このプログラムが何のプログラムかの概要](#このプログラムが何のプログラムかの概要)
- [プログラムの実行方法](#プログラムの実行方法)
- [プログラムのフォルダ構成](#プログラムのフォルダ構成)
- [学生がプログラムをどう組めばいいかの解説](#学生がプログラムをどう組めばいいかの解説)
- [各仕様書へのリンク](#各仕様書へのリンク)

## このプログラムが何のプログラムかの概要
ブラウザ上で動作する純ES Modules構成の対戦型タワーディフェンスゲームです。運営が両陣営のユニットスクリプトと設定ファイルを用意すると、ブラウザから戦闘を起動してリプレイを観戦できます。学生は与えられたSDKを用いて自チームのユニットAIを作成し、対戦形式で競い合います。

## プログラムの実行方法
1. リポジトリのルートで静的サーバーを起動します。
	 ```bash
	 python3 -m http.server --directory src 8000
	 ```
2. Codespaces のポート転送機能により自動で公開される `http://localhost:8000` にアクセスします。
3. ブラウザ上のUIからチーム編成を確認し、「戦闘開始」を押して試合を開始します。

## プログラムのフォルダ構成
```text
src/
	index.html            ブラウザエントリーポイント
	main.js               初期化・UI制御
	engine/               ゲームエンジン本体
	render/               描画とUIコンポーネント
	sdk/                  学生向けAPI・サンドボックス
	teams/                西軍・東軍の各ユニットスクリプト
	config/               チーム編成設定
	data/                 ジョブ・マップ定義
	assets/               画像・音声アセット
```

## 学生がプログラムをどう組めばいいかの解説
- ユニット1体につき1ファイルを `teams/west` または `teams/east` に配置します。
- 各ファイルでは `init(context)` と `update(state, api)` を必ず `export` します。
- `init` では `job`, `initialPosition`, 任意の `memory` を返し、`job` は `data/jobs.json` に定義済みのものを使用します。
- `update` では `api.actions`（例: `moveToward`, `attack`, `useSkill`）と `api.utils`（例: `findClosest`, `inRange`, `stepToward`）を使って行動を決定し、行動オブジェクトを `return` します。
- 状態をまたいで保持したい値は `state.memory` 経由で読み書きできます（`init` で返した参照が毎ターン渡されます）。

### 最小テンプレート
```javascript
export function init(context) {
	return {
		job: 'archer',
		initialPosition: { x: 5, y: 6 },
		memory: { lastTargetId: null }
	};
}

export function update(state, api) {
	const { self, enemies } = state;
	const { actions, utils } = api;
	const target = utils.findClosest(enemies, self.position);

	if (!target) {
		return actions.moveToward(20, self.position.y);
	}

	if (utils.inRange(self, target)) {
		state.memory.lastTargetId = target.id;
		return actions.attack(target);
	}

	const nextStep = utils.stepToward(self.position, target.position);
	return actions.moveToward(nextStep.x, nextStep.y);
}
```

## 各仕様書へのリンク
- [運営・開発者向け内部仕様書](doc/program.md)
- [学生向けプログラム仕様](doc/forstudent.md)
- [画面構成ガイド](doc/display.md)
- [ジョブ一覧・詳細](doc/job.md)
- [アセット一覧メモ](doc/imagelist.md)
- [機能リスト](doc/feature_list.md)