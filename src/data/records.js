// 勉強記録の読み書き。
// spec 4章: リアルタイム同期はしない。
//   - 起動時に fetchAllRecords() で最新をまとめて取得
//   - 保存/編集/削除のたびに Firestore へ書き込む
//   - オフライン時は SDK がキャッシュに溜め、復帰時に自動同期
// 個人利用で件数が限られるため、範囲クエリは使わず全件取得する。

import { getDocs, addDoc, updateDoc, deleteDoc, getDocFromCache } from 'firebase/firestore'
import { recordsCol, recordDoc } from './paths.js'

// Firestore のドキュメント → アプリ内で扱う素の形
function toRecord(snap) {
  const d = snap.data()
  return {
    id: snap.id,
    subject: d.subject ?? '',
    material: d.material ?? '',
    activity: d.activity ?? '',
    minutes: Number(d.minutes) || 0,
    date: d.date ?? '',
    memo: d.memo ?? '',
    createdAt: d.createdAt ?? 0,
    updatedAt: d.updatedAt ?? 0,
  }
}

// 入力値を Firestore に入れる形に整える
function normalize(input) {
  return {
    subject: String(input.subject ?? '').trim(),
    material: String(input.material ?? '').trim(),
    activity: String(input.activity ?? '').trim(),
    minutes: Math.max(0, Math.round(Number(input.minutes) || 0)),
    date: String(input.date ?? '').trim(),
    memo: String(input.memo ?? '').trim(),
  }
}

// 全記録を取得。日付の新しい順に並べて返す。
export async function fetchAllRecords(uid) {
  const qs = await getDocs(recordsCol(uid))
  const list = qs.docs.map(toRecord)
  list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
  return list
}

// 1件追加。作成したレコード(id 付き)を返す。
export async function addRecord(uid, input) {
  const now = Date.now()
  const data = { ...normalize(input), createdAt: now, updatedAt: now }
  const ref = await addDoc(recordsCol(uid), data)
  return { id: ref.id, ...data }
}

// 1件更新。渡したフィールドだけ上書きする。
export async function updateRecord(uid, id, patch) {
  const data = { ...normalize({ ...patch }), updatedAt: Date.now() }
  // patch に含まれないキーは normalize が空文字/0 にしてしまうので、
  // 実際に渡されたキーだけを残す
  const keys = ['subject', 'material', 'activity', 'minutes', 'date', 'memo']
  const out = { updatedAt: data.updatedAt }
  for (const k of keys) {
    if (k in patch) out[k] = data[k]
  }
  await updateDoc(recordDoc(uid, id), out)
}

// 1件削除。
export async function deleteRecord(uid, id) {
  await deleteDoc(recordDoc(uid, id))
}

// 参考: 特定ドキュメントがキャッシュにあるか(オフライン確認用。今は未使用)
export async function peekCache(uid, id) {
  try {
    const s = await getDocFromCache(recordDoc(uid, id))
    return s.exists() ? toRecord(s) : null
  } catch {
    return null
  }
}
