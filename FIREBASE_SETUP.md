# Firebase セットアップ手順

このアプリは「Google アカウントでのログイン」と「クラウドへのデータ保存」に Firebase を使います。
以下は **あなたが Firebase コンソールで行う作業** です。所要 10〜15 分。**すべて無料枠(Spark プラン)の範囲で、クレジットカードの登録は不要**です。

作業の全体像:

1. Firebase プロジェクトを作る
2. ウェブアプリを登録して「設定値」を6個もらう → `.env` に貼る
3. Google ログインを有効にする
4. Firestore データベースを作る
5. セキュリティルールを貼り付ける
6. (デプロイ後)公開URLを「承認済みドメイン」に追加する
7. 動作確認

---

## 1. Firebase プロジェクトを作る

1. <https://console.firebase.google.com/> を開き、自分の Google アカウントでログインする
2. 「**プロジェクトを追加**」をクリック
3. プロジェクト名を入力(例: `benkyoujikan`)。名前は後からでも変えられる
4. 「**このプロジェクトで Google アナリティクスを有効にする**」は **オフ** でよい(無くても動く。オンでも無料)
5. 「**プロジェクトを作成**」→ 完了まで待つ → 「**続行**」

---

## 2. ウェブアプリを登録して設定値をもらう

1. プロジェクトのトップ画面(Project Overview)で、中央あたりの **`</>`(ウェブ)** アイコンをクリック
   - 見当たらない場合: 左上の歯車 → **プロジェクトの設定** → 下にスクロールして「マイアプリ」の「アプリを追加」→ `</>`
2. 「アプリのニックネーム」を入力(例: `benkyoujikan-web`)
3. 「**このアプリの Firebase Hosting も設定する**」は **チェックしない**(公開は GitHub Pages を使うため)
4. 「**アプリを登録**」
5. 次の画面に `const firebaseConfig = { ... }` というコードが表示される。この中身を使う

表示された値を、プロジェクト直下の `.env`(無ければ `.env.example` をコピーして作る)に、次のように対応させて貼り付ける:

| firebaseConfig の中 | `.env` の行 |
|---|---|
| `apiKey: "AIza..."` | `VITE_FIREBASE_API_KEY=AIza...` |
| `authDomain: "xxx.firebaseapp.com"` | `VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com` |
| `projectId: "xxx"` | `VITE_FIREBASE_PROJECT_ID=xxx` |
| `storageBucket: "xxx.appspot.com"` | `VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com` |
| `messagingSenderId: "1234..."` | `VITE_FIREBASE_MESSAGING_SENDER_ID=1234...` |
| `appId: "1:1234:web:abcd..."` | `VITE_FIREBASE_APP_ID=1:1234:web:abcd...` |

- 値は **クォート(`"`)を付けずに** `=` の右側にそのまま書く
- 書き換えたら、開発サーバーを **一度止めて起動し直す**(`.env` は起動時にしか読まれない)

> `apiKey` は秘密のパスワードではなく、プロジェクトを識別する名札です。公開されても問題ありません。
> 実際のアクセス制御は手順5のセキュリティルールで行います。`.env` は念のため Git に含めない設定にしてあります。

---

## 3. Google ログインを有効にする

1. 左メニュー **構築 > Authentication** を開く
2. 「**始める**」をクリック
3. 「Sign-in method」タブ → プロバイダ一覧から「**Google**」を選ぶ
4. 右上の **有効にする** をオンにする
5. 「プロジェクトの公開名」(そのままでよい)と「**プロジェクトのサポートメール**」(自分のアドレスを選ぶ)を設定
6. 「**保存**」

---

## 4. Firestore データベースを作る

1. 左メニュー **構築 > Firestore Database** を開く
2. 「**データベースの作成**」をクリック
3. ロケーション: `asia-northeast1`(東京)を選ぶ。**一度決めると変更できない**
4. モード: 「**本番環境モードで開始**」を選ぶ(この後すぐルールを入れるので閉じた状態で始めて問題ない)
5. 「**作成**」→ 完了まで待つ

---

## 5. セキュリティルールを貼り付ける

1. Firestore Database の画面で「**ルール**」タブを開く
2. 表示されている内容を全部消して、このリポジトリの [`firestore.rules`](firestore.rules) の中身をまるごと貼り付ける
3. 「**公開**」をクリック

これで「ログイン済みの本人だけが、自分のデータを読み書きできる」状態になります。
貼り付ける内容(参考):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 6. (デプロイ後)公開URLを承認済みドメインに追加する

ローカル(`localhost`)は最初から許可されています。GitHub Pages で公開したあと、その URL からログインできるようにするには:

1. **Authentication > Settings** タブ → 「**承認済みドメイン**」
2. 「**ドメインの追加**」→ 公開URLのドメイン部分(例: `puratinam457581.github.io`)を入力して追加

> この作業はフェーズ9(デプロイ)のあとで行います。今はやらなくて構いません。

---

## 7. 動作確認

1. `.env` を保存したら開発サーバーを起動し直す

   ```bash
   npm run dev
   ```

2. ブラウザで開くと「Google アカウントでログイン」ボタンが出る(未設定なら「Firebase が未設定です」と出る → `.env` を見直す)
3. ログインすると、名前・メール・uid と「テスト記録を1件追加」ボタンが出る
4. ボタンを押して記録が1件増え、ページを再読み込みしても残っていれば、Firestore への保存・読み込みができている
5. Firebase コンソール **Firestore Database > データ** を見ると `users/(あなたのuid)/records/...` にデータが入っているのが確認できる

---

## うまくいかないときの見どころ

| 症状 | 見るところ |
|---|---|
| 「Firebase が未設定です」から変わらない | `.env` のファイル名が正しいか(`.env.txt` になっていないか)。`VITE_` の綴り。サーバーを再起動したか |
| ログインのポップアップが「認証ドメインが承認されていません」で失敗 | 手順6。`localhost` は既定で入っているはずなので、まずポップアップのブロックを確認 |
| 記録の追加で「Missing or insufficient permissions」 | 手順5のルールを公開したか。ログインできているか(uid が表示されているか) |
| ポップアップがすぐ閉じる | ブラウザのポップアップブロックを解除。別タブで Google にログインしておくと安定する |
