# 勉強時間管理アプリ

日々の勉強時間を「教科 → 教材 → 活動内容」の3階層で記録し、今日の合計・累計・期間比較を可視化する PWA。

- 記録は勉強のあとにまとめて入力する方式（タイマー起動は必須にしない）
- データは Google アカウントに紐づけて Firebase Firestore に保存し、複数端末で同期
- オフラインでも記録でき、オンライン復帰時に自動同期
- スマホのホーム画面に追加して使う想定
- ダーク（SF調）／ライト（白基調）の2テーマ

仕様の詳細は [spec.md](spec.md)、開発ルールは [CLAUDE.md](CLAUDE.md) を参照。

## 技術スタック

React 19 / Tailwind CSS 4 / Vite 8 / vite-plugin-pwa / Firebase Authentication + Cloud Firestore

グラフ（円・棒）は外部ライブラリを使わず SVG／div を自前描画。ホスティングは GitHub Pages（無料枠）。

## 画面

| タブ | 内容 |
|---|---|
| ホーム | 今日の合計勉強時間（特大）・今日の教科別ドーナツ・今日の記録・各画面への導線 |
| カレンダー | 月グリッド（日ごとの合計）・日タップでその日の内訳 |
| 総計 | 総勉強時間・記録数/日数/平均・教科別/教材別/活動内容別の集計 |
| 比較 | 今日/昨日・今週/先週・今月/先月 の固定比較（増減・％・棒グラフ・サマリー文） |
| 設定 | アカウント・テーマ切替・教材ごとの色/アイコン |

画面右下の「記録する」ボタンはどの画面でも常時表示。

## セットアップ（ローカル開発）

```bash
npm install
```

Firebase の設定が必要です。手順は [FIREBASE_SETUP.md](FIREBASE_SETUP.md) を参照し、
`.env.example` をコピーして `.env` を作り、Firebase コンソールで取得した設定値を記入します。

```bash
npm run dev       # 開発サーバー
npm run build     # 本番ビルド
npm run preview   # ビルド結果の確認（PWA動作はこちらで）
npm run icons     # アプリアイコン(PNG)を再生成
```

## 公開する（GitHub Pages）

`base: './'` で相対パス出力にしてあるため、リポジトリ名が何でも設定変更なしで動きます。

### 1. GitHub にリポジトリを作って push する

- GitHub で **Public** の空リポジトリを作る（Private は Pages が有料。公開されるのはコードのみ）
- 手元のリポジトリを push する:

```bash
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

### 2. Firebase の設定値をリポジトリに登録する

`.env` はリポジトリに含めないため、公開ビルド用に GitHub 側へ登録します（秘密情報ではなく、
コードに直書きしないための分離です。実際の防御は Firestore のセキュリティルール）。

- リポジトリの **Settings → Secrets and variables → Actions → Variables** タブ
- **New repository variable** で、`.env` の6行をそのまま1つずつ登録する:
  `VITE_FIREBASE_API_KEY` / `VITE_FIREBASE_AUTH_DOMAIN` / `VITE_FIREBASE_PROJECT_ID` /
  `VITE_FIREBASE_STORAGE_BUCKET` / `VITE_FIREBASE_MESSAGING_SENDER_ID` / `VITE_FIREBASE_APP_ID`
  （Secrets ではなく **Variables** タブ側に入れます）

### 3. Pages を有効にする

- **push した直後にワークフローが1回走りますが、必ず失敗します**（Pages がまだ有効でないため）。壊れていません。
- リポジトリの **Settings → Pages → Build and deployment → Source** を **「GitHub Actions」** に変更
- **Actions** タブ → 「GitHub Pages に公開」ワークフロー → **Run workflow** で再実行
- 成功すると `https://<ユーザー名>.github.io/<リポジトリ名>/` で開けます

### 4. Firebase にドメインを登録する

公開URLからログインできるようにします。

- Firebase コンソール → **Authentication → Settings → 承認済みドメイン**
- 「ドメインの追加」→ `<ユーザー名>.github.io` を追加

### 5. スマホで使う

- スマホのブラウザで公開URLを開く
- **iPhone**: 共有 → 「ホーム画面に追加」
- **Android**: メニュー → 「アプリをインストール」／「ホーム画面に追加」
- 追加したアイコンから起動するとブラウザのバーが消え、オフラインでも動きます

## ライセンス

個人利用。
