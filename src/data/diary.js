// 日記(任意記入)。ユーザーが書きたいときだけ書く。強制しない。
// 「前日の日記」として過去ログ出力に含め、AIが前日の実績・所感を把握できるようにする。

import { getDocs, setDoc, deleteDoc } from 'firebase/firestore'
import { diaryCol, diaryDoc } from './paths.js'

// { 'YYYY-MM-DD': text } の形で全件取得
export async function fetchAllDiary(uid) {
  const qs = await getDocs(diaryCol(uid))
  const map = {}
  for (const d of qs.docs) {
    const text = d.data()?.text
    if (text) map[d.id] = text
  }
  return map
}

// 保存。空文字にしたら削除する(「書かない」を選べるように)。
// 返り値: 保存後のテキスト(削除した場合は null)
export async function saveDiaryEntry(uid, date, text) {
  const t = String(text || '').trim()
  if (!t) {
    await deleteDoc(diaryDoc(uid, date))
    return null
  }
  await setDoc(diaryDoc(uid, date), { text: t, updatedAt: Date.now() })
  return t
}
