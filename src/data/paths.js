// Firestore のドキュメント/コレクションのパスを1か所にまとめる。
// すべて users/{uid}/... の下にぶら下げ、セキュリティルールで
// 「自分の uid のデータしか読み書きできない」を保証する。

import { collection, doc } from 'firebase/firestore'
import { db } from '../firebase/config.js'

// 勉強記録のコレクション: users/{uid}/records
export function recordsCol(uid) {
  return collection(db, 'users', uid, 'records')
}
export function recordDoc(uid, recordId) {
  return doc(db, 'users', uid, 'records', recordId)
}

// タグ履歴(教科→教材→活動内容)の1ドキュメント: users/{uid}/meta/tags
export function tagsDoc(uid) {
  return doc(db, 'users', uid, 'meta', 'tags')
}

// 教材ごとのアイコン・色: users/{uid}/meta/materialStyles
export function materialStylesDoc(uid) {
  return doc(db, 'users', uid, 'meta', 'materialStyles')
}

// 教材マスタ(学習管理システム連携): users/{uid}/meta/materials
//   { items: [{ id, subject, name, done, createdAt }], updatedAt }
export function masterDoc(uid) {
  return doc(db, 'users', uid, 'meta', 'materials')
}

// アプリ設定(現在フェーズ開始日など): users/{uid}/meta/appConfig
export function appConfigDoc(uid) {
  return doc(db, 'users', uid, 'meta', 'appConfig')
}
