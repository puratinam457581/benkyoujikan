// タグ履歴(教科 → 教材 → 活動内容)と、教材ごとの見た目(色・アイコン)。
// spec 5章: 事前登録は不要。記録時に入力された値をここに溜め、
//           次回から候補として出す。
//
// 保存先はどちらも1ドキュメントにまとめる(件数が小さく、読み書きが単純なため)。
//   users/{uid}/meta/tags           … 履歴 + よく使う組み合わせ
//   users/{uid}/meta/materialStyles … 教材ごとの色・アイコン

import { getDoc, setDoc } from 'firebase/firestore'
import { tagsDoc, materialStylesDoc } from './paths.js'

// 教材キー: 「教科 ▸ 教材」。activities / materialStyles の入れ子キーに使う。
export function comboKey(subject, material) {
  return `${String(subject).trim()} ▸ ${String(material).trim()}`
}

const emptyTags = () => ({
  subjects: [],
  materials: {}, // { [subject]: string[] }
  activities: {}, // { [comboKey]: string[] }
  combos: [], // [{ subject, material, activity, count, lastUsedAt }]
})

function normalizeTags(data) {
  const t = emptyTags()
  if (!data) return t
  if (Array.isArray(data.subjects)) t.subjects = data.subjects.filter(Boolean)
  if (data.materials && typeof data.materials === 'object') t.materials = data.materials
  if (data.activities && typeof data.activities === 'object') t.activities = data.activities
  if (Array.isArray(data.combos)) t.combos = data.combos
  return t
}

// 末尾に足す(既にあれば動かさない)。新しい候補ほど後ろ。
function pushUnique(arr, value) {
  const v = String(value).trim()
  if (!v) return arr
  if (arr.includes(v)) return arr
  return [...arr, v]
}

export async function fetchTags(uid) {
  const snap = await getDoc(tagsDoc(uid))
  return normalizeTags(snap.exists() ? snap.data() : null)
}

// 記録を保存したときに呼ぶ。履歴と「よく使う組み合わせ」を更新する。
// 更新後のタグオブジェクトを返す(画面側の state 差し替え用)。
export async function recordTagUsage(uid, { subject, material, activity }) {
  const s = String(subject).trim()
  const m = String(material).trim()
  const a = String(activity).trim()
  const t = await fetchTags(uid)

  t.subjects = pushUnique(t.subjects, s)
  if (m) {
    t.materials[s] = pushUnique(t.materials[s] || [], m)
  }
  if (m && a) {
    const ck = comboKey(s, m)
    t.activities[ck] = pushUnique(t.activities[ck] || [], a)
  }

  // よく使う組み合わせ: 完全一致でカウントを増やし、無ければ追加
  if (s && m && a) {
    const idx = t.combos.findIndex(
      (c) => c.subject === s && c.material === m && c.activity === a,
    )
    if (idx >= 0) {
      t.combos[idx] = {
        ...t.combos[idx],
        count: (t.combos[idx].count || 0) + 1,
        lastUsedAt: Date.now(),
      }
    } else {
      t.combos.push({ subject: s, material: m, activity: a, count: 1, lastUsedAt: Date.now() })
    }
  }

  await setDoc(tagsDoc(uid), { ...t, updatedAt: Date.now() })
  return t
}

// 候補(タグ履歴)から1件消す。指定した階層だけを対象にする。
//   { subject }                    … その教科と、ぶら下がる教材・活動・組み合わせ・色設定を全部
//   { subject, material }          … その教材と、ぶら下がる活動・組み合わせ・色設定
//   { subject, material, activity }… その活動内容と、一致する組み合わせだけ
// 過去の記録(records)は消さない。記録を再保存すると候補として復活する。
// 返り値: 更新後の { tags, materialStyles }
export async function deleteTag(uid, { subject, material, activity }) {
  const s = String(subject || '').trim()
  const m = String(material || '').trim()
  const a = String(activity || '').trim()
  const t = await fetchTags(uid)
  const styles = await fetchMaterialStyles(uid)
  let stylesChanged = false

  const dropStyle = (key) => {
    if (styles[key] !== undefined) {
      delete styles[key]
      stylesChanged = true
    }
  }

  if (s && m && a) {
    const ck = comboKey(s, m)
    if (Array.isArray(t.activities[ck])) {
      t.activities[ck] = t.activities[ck].filter((x) => x !== a)
      if (t.activities[ck].length === 0) delete t.activities[ck]
    }
    t.combos = t.combos.filter(
      (c) => !(c.subject === s && c.material === m && c.activity === a),
    )
  } else if (s && m) {
    const ck = comboKey(s, m)
    if (Array.isArray(t.materials[s])) {
      t.materials[s] = t.materials[s].filter((x) => x !== m)
      if (t.materials[s].length === 0) delete t.materials[s]
    }
    delete t.activities[ck]
    t.combos = t.combos.filter((c) => !(c.subject === s && c.material === m))
    dropStyle(ck)
  } else if (s) {
    t.subjects = t.subjects.filter((x) => x !== s)
    delete t.materials[s]
    const prefix = `${s} ▸ `
    for (const k of Object.keys(t.activities)) {
      if (k === s || k.startsWith(prefix)) delete t.activities[k]
    }
    t.combos = t.combos.filter((c) => c.subject !== s)
    for (const k of Object.keys(styles)) {
      if (k === 'updatedAt') continue
      if (k.startsWith(prefix)) dropStyle(k)
    }
  }

  await setDoc(tagsDoc(uid), { ...t, updatedAt: Date.now() })
  if (stylesChanged) {
    await setDoc(materialStylesDoc(uid), { ...styles, updatedAt: Date.now() })
  }
  return { tags: t, materialStyles: styles }
}

// よく使う順(回数 → 直近使用)に上位 n 件。フェーズ3のショートカット表示で使う。
export function topCombos(tags, n = 6) {
  return [...(tags.combos || [])]
    .sort((a, b) => (b.count || 0) - (a.count || 0) || (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
    .slice(0, n)
}

// ---- 教材ごとの色・アイコン --------------------------------------------

export async function fetchMaterialStyles(uid) {
  const snap = await getDoc(materialStylesDoc(uid))
  return snap.exists() ? snap.data() : {}
}

export async function setMaterialStyle(uid, subject, material, style) {
  const ck = comboKey(subject, material)
  await setDoc(
    materialStylesDoc(uid),
    { [ck]: { ...style }, updatedAt: Date.now() },
    { merge: true },
  )
}
