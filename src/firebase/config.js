// Firebase の初期化。
// 設定値は .env(環境変数)から読む。コードには直書きしない。
// .env が未設定のあいだは isFirebaseConfigured === false になり、
// アプリはログイン画面で「設定待ち」を表示する(フェーズ1)。

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 最低限これだけあれば認証と Firestore は動く。
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
)

let app = null
let auth = null
let db = null
let googleProvider = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()

  // オフライン永続化(spec 4章)。
  // 端末内にキャッシュを持ち、オフラインでも読み書きでき、
  // オンライン復帰時に自動で同期する。複数タブ対応版を使う。
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  })
}

export { app, auth, db, googleProvider }
