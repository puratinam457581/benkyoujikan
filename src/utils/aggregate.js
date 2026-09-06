// 記録の集計。画面側はここを通して「合計」「教科別」などを取り出す。

import { colorForSubject, colorForActivity, defaultColorFor } from './materialStyle.js'

export function sumMinutes(records) {
  return records.reduce((s, r) => s + (r.minutes || 0), 0)
}

// 日付が一致する記録
export function recordsOnDate(records, dateStr) {
  return records.filter((r) => r.date === dateStr)
}

// 'YYYY-MM-DD' → 合計分 の Map(カレンダーのセル表示用)
export function minutesByDate(records) {
  const map = new Map()
  for (const r of records) {
    if (!r.date) continue
    map.set(r.date, (map.get(r.date) || 0) + (r.minutes || 0))
  }
  return map
}

// start <= date <= end(いずれも 'YYYY-MM-DD' の文字列比較でよい)
export function recordsInRange(records, startStr, endStr) {
  return records.filter((r) => r.date >= startStr && r.date <= endStr)
}

function colorFor(field, key, sampleRecord) {
  if (field === 'subject') return colorForSubject(key)
  if (field === 'activity') return colorForActivity(key)
  if (field === 'material') return defaultColorFor(sampleRecord?.subject || '', key)
  return colorForSubject(key)
}

// 指定キー('subject' | 'material' | 'activity')で合計時間を集計。
// 返り値: [{ key, minutes, count, color }] を minutes 降順で。
export function groupBy(records, field) {
  const map = new Map()
  for (const r of records) {
    const k = r[field] || '(未設定)'
    const cur = map.get(k) || { minutes: 0, count: 0, sample: r }
    cur.minutes += r.minutes || 0
    cur.count += 1
    map.set(k, cur)
  }
  const list = [...map.entries()].map(([key, v]) => ({
    key,
    minutes: v.minutes,
    count: v.count,
    color: colorFor(field, key, v.sample),
  }))
  list.sort((a, b) => b.minutes - a.minutes)
  return list
}

// 教科別の割合(円グラフ用)。[{ key, minutes, color, ratio }]
export function subjectBreakdown(records) {
  const total = sumMinutes(records)
  return groupBy(records, 'subject').map((row) => ({
    ...row,
    ratio: total > 0 ? row.minutes / total : 0,
  }))
}

// 全体のサマリー(総計画面のヘッダー用)
export function studyStats(records) {
  const totalMin = sumMinutes(records)
  const dates = new Set(records.map((r) => r.date).filter(Boolean))
  const days = dates.size
  const sorted = [...dates].sort()
  return {
    totalMin,
    count: records.length,
    days,
    avgPerDayMin: days > 0 ? Math.round(totalMin / days) : 0,
    firstDate: sorted[0] || null,
    lastDate: sorted[sorted.length - 1] || null,
  }
}

// 「教科・教材・活動」ごとの集計(総計画面用)
export function comboBreakdown(records) {
  const map = new Map()
  for (const r of records) {
    const k = `${r.subject}␟${r.material}␟${r.activity}`
    const cur = map.get(k) || { subject: r.subject, material: r.material, activity: r.activity, minutes: 0, count: 0 }
    cur.minutes += r.minutes || 0
    cur.count += 1
    map.set(k, cur)
  }
  return [...map.values()].sort((a, b) => b.minutes - a.minutes)
}
