// 認証まわりの薄いラッパー。
// 画面側は React の useAuth()(src/auth/AuthProvider.jsx)を通して使う。
// ここは Firebase SDK を直接触る唯一の場所。

import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './config.js'

// ログイン状態が変わるたびに callback(user) を呼ぶ。
// user は Firebase の User オブジェクト、未ログインなら null。
// 返り値は購読解除の関数。
export function watchAuth(callback) {
  if (!isFirebaseConfigured) {
    // 設定前は「未ログイン確定」として扱い、ローディングを終わらせる
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

// Google アカウントでログイン。
// ポップアップで Google の画面を開く。パスワードはこのアプリを通らない。
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase が未設定です(.env を作成してください)')
  }
  return signInWithPopup(auth, googleProvider)
}

export async function signOut() {
  if (!isFirebaseConfigured) return
  return fbSignOut(auth)
}
