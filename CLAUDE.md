# CLAUDE.md

このファイルは Claude Code がこのリポジトリで作業する際の運用ルールです。
**機能仕様の正典は [spec.md](spec.md)。** 実装内容の判断は必ず spec.md を参照すること。
本ファイルには spec.md の内容を複製せず、「守るべきルール」「現在の状態」「コマンド」のみを記載する。

---

## プロジェクト概要

日々の勉強時間を記録・可視化する **PWA**。教科 → 教材 → 活動内容 の3階層タグで記録する。

- 想定ユーザー: 開発者本人1名(大学1年生・プログラミング初学者)。
- 想定端末: スマホ + ホーム画面に追加(PWA起動)。モバイルファースト、PC表示も崩さない。
- データはアカウント(Googleログイン)に紐づけて Firebase Firestore に保存し、複数端末で同期する。

**最優先事項(spec 1章):**
1. 記録のシームレスさ — 登録を可能な限り手間なく
2. 勉強時間の可視化 — 「今まで/今日どれくらい勉強したか」を直感的に

---

## 絶対制約(逸脱不可)

1. **完全無料。** Firebase 無料枠(Spark プラン)の範囲で構築する。従量課金が発生し得る構成(Blaze プラン、有料 API)は採用しない。
2. **バックエンドサーバーを立てない。** 全ロジックはクライアント側 + Firebase(BaaS)で完結させる。
3. **オフラインで動作すること。** 記録の閲覧・登録・編集がネットワークなしで可能で、復帰時に自動同期する(Firestore オフライン永続化)。
4. **Firebase の設定値は .env から読む。** コードに直書きしない。`.env` はコミットしない。
5. 新しい npm パッケージを導入する際は、**ライセンスと無料性を確認**した上で、導入理由をユーザーに説明してから入れる。

---

## 技術スタック(確定・変更する場合は要相談)

| レイヤー | 採用技術 |
|---|---|
| フレームワーク | React 19(関数コンポーネント + Hooks) |
| スタイリング | Tailwind CSS 4(テーマ定義は src/index.css の @theme) |
| ビルド | Vite 8 |
| PWA | vite-plugin-pwa(Service Worker / manifest 自動生成) |
| 認証 | Firebase Authentication(Google ログインのみ) |
| データベース | Cloud Firestore(オフライン永続化 ON) |
| グラフ | 外部ライブラリを使わず SVG を自前描画(円グラフ・棒グラフ) |
| アイコン | lucide-react(ISC) |
| テーマ | ダーク(SF・HUD調)/ ライト(白基調)の2構成。CSS変数を `<html data-theme>` で切替 |
| レイアウト | 768px未満=スマホ幅+下部タブバー / 768px以上=左サイドバー |
| ホスティング | GitHub Pages(無料枠。リポジトリは Public) |

---

## 作業の進め方(厳守)

- **返答は常に日本語。**
- **ユーザーはプログラミング初学者。** 技術用語はかみ砕き、なぜそれを選ぶのか理由を添える。
- **推測で実装しない。** spec.md に記載がない挙動、曖昧・矛盾する記述に出会ったら、実装を止めてユーザーに質問する。
- **フェーズ単位で進める。** 下の「実装フェーズ」の順序を守る。1フェーズ完了ごとに「実装したこと / 次に確認してほしいこと」を報告し、**承認を得てから次フェーズに着手する**。先取りしない。
- **各フェーズ完了時にコミットを作る。** 動作確認はユーザー自身が行う。コミット・プッシュはユーザーから指示があったときのみ。
- **ファイル/フォルダを削除しない。** 削除が必要な場合はプロジェクト直下に `削除用フォルダ/` を作成してそこへ移動し、実際に削除してよいかユーザーに確認する。

---

## 過去プロジェクト(時間割アプリ)からの学び

PWA化・デプロイ・Tailwind4・CSS変数まわりは、以前作った時間割アプリ(`C:\Users\tkg07\Desktop\claude_space\jikannwari`、公開済み)で踏んだ地雷が Obsidian(`Code/Knowledge/`・`Code/Decisions/`)に記録されている。**着手前に該当ノートを読むこと。** 主なもの:

- `github-pages-vite-pwa.md` — `base:'./'` / `start_url:'.'` / `scope:'.'` / `public/.nojekyll` でサブパス公開に対応。初回ワークフローは必ず失敗する→Settings→Pages→Source を GitHub Actions にして再実行。`workflow_dispatch:` を入れる。Public リポジトリ必須。
- `github-push-gh007-email.md` — コミットの著者メールは noreply 形式(設定済み)。実メールだと push が GH007 で拒否される。
- `css-variable-scope.md` — 要素ごとに違う値を入れる CSS 変数(教材の色など)は `:root` で合成しない。使う側のルールで `var()` する。
- `tailwind-layer-order.md` — 自作ユーティリティと標準クラスを同一要素で併用しない。名前付き `@layer components` クラスにする。
- `tailwind4-canvas-export.md` — Tailwind4 は `oklch()`/`color-mix()` 出力。画像化が必要なら html2canvas ではなく canvas 自前描画。
- `ios-pwa-notification-limits.md` — サーバー無し構成では iOS PWA の定時通知は不可能。リマインダー(spec 9章・保留)を実装するなら「ローカル通知 + 起動時キャッチアップ」+ `.ics` 書き出し。

**注意:** 時間割アプリの絶対制約「Firebase 不使用」は**この案件には適用されない**(spec.md が明示的に Firebase 無料枠を要求)。「完全無料・バックエンドを立てない・オフライン動作」は共通で維持する。

---

## 実装上の注意

- **データ消失より二重管理に注意。** 正典は Firestore。ローカルはキャッシュ + 起動時取得した状態のみ。複数端末の同時編集は想定しない(競合解決の仕組みは作らない)。
- **セキュリティルール必須。** Firestore は「ログイン済みで自分の uid のデータのみ読み書き可」に設定する(FIREBASE_SETUP.md)。
- **タグは履歴で育つ。** 教科・教材・活動内容は事前登録不要。記録時に入力された新規の値を候補として保存し、次回からワンタップ選択できるようにする。
- **iOS PWA 制約:** ホーム画面に追加した状態でのみ通知等が動く(iOS 16.4+)。リマインダーは spec 9章の保留事項。

---

## コマンド

```bash
npm install       # 依存インストール
npm run dev       # 開発サーバー起動
npm run build     # 本番ビルド
npm run preview   # ビルド結果のローカル確認(PWA動作確認はこちら)
```

---

## 実装フェーズと現在の状態

- [x] 仕様書(spec.md)
- [x] フェーズ0: プロジェクト初期化(Vite 8 + React 19 + Tailwind 4 + PWA + Firebase SDK、テーマ変数の土台)
- [x] フェーズ1: データ層 + 認証(Google ログイン / AuthProvider・DataProvider / records・tags データ層 / firestore.rules / FIREBASE_SETUP.md)。実機確認済み
- [x] フェーズ2: 画面骨組み + 2テーマ(自前ナビ NavigationContext / 下部タブ TabBar・PCサイドバー Sidebar / ThemeProvider で dark↔light 切替 + localStorage 保持 / フォント同梱 / 設定画面は実装、他4画面は仮)
- [x] フェーズ3: 記録フロー。記録FAB→RecordModal(教科→教材→活動内容の3階層 TagChips、絞り込み候補、時間/分の2フィールド、日付、メモ、ショートカット=topCombos、前回と同じ、編集/削除 RecordRow)/ 教材の色・アイコン(materialStyle.js + 設定の MaterialStylesSection)
- [x] フェーズ4: ホーム画面(HomeScreen)。今日の合計を特大表示 / 今日の教科別ドーナツ(PieChart・SubjectBreakdown、SVG自前描画)/ 今日の記録一覧 / 総計・カレンダー・比較への導線。集計は utils/aggregate.js、教科色は名前ハッシュ(colorForSubject)。旧 HomeInterim は 削除用フォルダ/ へ移動
- [x] フェーズ5: カレンダー画面(CalendarScreen)。月グリッド(日曜始まり)・日セルに合計(h表記)+濃淡・前後月/今月 / 日タップでその日の内訳(SubjectBreakdown + RecordRow)。aggregate.minutesByDate 追加。※副産物: .app-body に flex:1 を追加(フェーズ2からの潜在バグ、コンテンツ幅が縮む問題を修正)
- [x] フェーズ6: 総計画面(TotalScreen)。総勉強時間 + 記録数/日数/1日平均(studyStats)/ 教科別・教材別・活動内容別 の切替ドーナツ(GroupBreakdown、groupBy を全 field 対応 + count/color)/ 教科×教材×活動 の内訳リスト(comboBreakdown)。SubjectBreakdown は GroupBreakdown の薄いラッパに変更
- [x] フェーズ7: 比較機能 + 月間サマリー(CompareScreen)。日次(今日/昨日)・週次(今週/先週)・月次(今月/先月)の固定比較。サマリー文 + 増減(分・%) + 棒グラフ(BarChart) + 教科別増減リスト + 現在期間の教科別ドーナツ。utils/compare.js。月次セクションが spec 7.3 の月間サマリーを兼ねる。PlaceholderScreen は 削除用フォルダ/ へ
- [x] フェーズ8: PWA仕上げ。scripts/generate-icons.mjs(zlib のみで PNG 生成、棒グラフモチーフ)/ src/pwa/{register.js, updateBus.js, PwaBanner.jsx}(virtual:pwa-register で SW 登録、更新は prompt 方式、更新/オフライン通知バナー)/ main.jsx で registerPWA()。dev サーバーで SW 登録・manifest・アイコン配信を確認。※実オフライン動作と更新バナーの最終確認はデプロイ後(GitHub Pages)に行う
- [x] フェーズ9: デプロイ準備。.github/workflows/deploy.yml(push main + workflow_dispatch、build ステップで VITE_FIREBASE_* を ${{ vars.* }} から注入)/ README に公開手順(Public リポジトリ / Settings→Actions→Variables に6項目登録 / 初回失敗→Source を GitHub Actions→再実行 / 承認済みドメイン追加 / スマホでホーム画面追加)。相対パス出力・.nojekyll をビルドで確認
      → 残るはユーザーによる公開作業(GitHub リポジトリ作成・push・Variables 登録・Pages 有効化)と実機確認
      ※ .env.production を一度コミット候補にしたが、API キー文字列が自動分類器にブロックされたため
        GitHub Actions Variables 方式に変更。設定値の実ファイルは 削除用フォルダ/env.production.txt に退避

★ spec 1〜8章の中核機能はフェーズ0〜9で一通り実装完了。
   spec 9章の未確定事項(タイマー / ストリーク / リマインダー通知)は未着手。必要になったら追加検討。

進捗が動いたら、このチェックリストを更新すること。
