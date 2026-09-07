// 全データ削除。記録・タグ履歴・教材スタイル・教材マスタ・アプリ設定を消す。
// アカウント(ログイン)は残す。取り消せない。

import { getDocs, writeBatch, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config.js'
import { recordsCol, tagsDoc, materialStylesDoc, masterDoc, appConfigDoc } from './paths.js'

export async function wipeAllData(uid) {
  // 記録はコレクションなので1件ずつ削除(バッチで束ねる)
  const qs = await getDocs(recordsCol(uid))
  const docs = qs.docs
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db)
    for (const d of docs.slice(i, i + 400)) batch.delete(d.ref)
    await batch.commit()
  }
  // meta 系の単一ドキュメント
  await Promise.all([
    deleteDoc(tagsDoc(uid)).catch(() => {}),
    deleteDoc(materialStylesDoc(uid)).catch(() => {}),
    deleteDoc(masterDoc(uid)).catch(() => {}),
    deleteDoc(appConfigDoc(uid)).catch(() => {}),
  ])
}
