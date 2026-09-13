// 全データ削除。記録・タグ履歴・教材スタイル・教材マスタ・アプリ設定・日記を消す。
// アカウント(ログイン)は残す。取り消せない。

import { getDocs, writeBatch, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import {
  recordsCol,
  tagsDoc,
  materialStylesDoc,
  masterDoc,
  appConfigDoc,
  diaryCol,
} from './paths.js'

// コレクションを1件ずつバッチ削除する(400件ずつ束ねる)
async function wipeCollection(col) {
  const qs = await getDocs(col)
  const docs = qs.docs
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db)
    for (const d of docs.slice(i, i + 400)) batch.delete(d.ref)
    await batch.commit()
  }
}

export async function wipeAllData(uid) {
  await wipeCollection(recordsCol(uid))
  await wipeCollection(diaryCol(uid))
  // meta 系の単一ドキュメント
  await Promise.all([
    deleteDoc(tagsDoc(uid)).catch(() => {}),
    deleteDoc(materialStylesDoc(uid)).catch(() => {}),
    deleteDoc(masterDoc(uid)).catch(() => {}),
    deleteDoc(appConfigDoc(uid)).catch(() => {}),
  ])
}
