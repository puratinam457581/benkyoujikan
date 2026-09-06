# 勉強時間管理アプリ

日々の勉強時間を「教科 → 教材 → 活動内容」の3階層で記録し、今日の合計・累計・期間比較を可視化する PWA。

- 記録は勉強のあとにまとめて入力する方式(タイマー起動は必須にしない)
- データは Google アカウントに紐づけて Firebase Firestore に保存し、複数端末で同期
- オフラインでも記録でき、オンライン復帰時に自動同期
- スマホのホーム画面に追加して使う想定

仕様の詳細は [spec.md](spec.md)、開発ルールは [CLAUDE.md](CLAUDE.md) を参照。

## 技術スタック

React 19 / Tailwind CSS 4 / Vite 8 / vite-plugin-pwa / Firebase Authentication + Cloud Firestore

グラフは外部ライブラリを使わず SVG を自前描画。ホスティングは GitHub Pages(無料枠)。

## セットアップ

```bash
npm install
```

Firebase の設定が必要です。手順は [FIREBASE_SETUP.md](FIREBASE_SETUP.md)(フェーズ1で追加)を参照してください。
`.env.example` をコピーして `.env` を作り、Firebase コンソールで取得した設定値を記入します。

```bash
npm run dev       # 開発サーバー
npm run build     # 本番ビルド
npm run preview   # ビルド結果の確認(PWA動作はこちらで)
```

## ライセンス

個人利用。
