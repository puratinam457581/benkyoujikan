// 教材の進捗(任意)。単位は教材ごとに自由(ページ/レッスン/回など)。
//
// 「現在地点」は次の2種類のチェックポイントから求める:
//   - baseline: 設定画面で決めた基準値(進捗を設定/補正した時点の値。その時点までの
//     累計時間とセットで保存する。master.js の item.baseline)
//   - 記録ごとの進捗: 記録(RecordModal)に任意で付けた progress 値。その記録までの
//     累計時間とセットで扱う
// 最新のチェックポイントが「現在地点」。直近7日以内にもう1点あれば、その2点間の
// (経過時間 ÷ 進んだ量)を「直近のペース」として残り時間を見積もる。無ければ
// 直近2点(日数を問わない)にフォールバックする。1点しか無ければ見積もりは出さない。

import { todayStr, addDaysStr } from './date.js'

const RECENT_WINDOW_DAYS = 7

function sortRecords(records) {
  return [...records].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : (a.createdAt || 0) - (b.createdAt || 0),
  )
}

// 教材ごとの進捗チェックポイント列 [{ date, minutesAt(=そこまでの累計時間), current }]
function buildCheckpoints(records, item) {
  const checkpoints = []
  if (item.baseline && Number.isFinite(item.baseline.current)) {
    checkpoints.push({
      date: item.baseline.date || '',
      minutesAt: item.baseline.minutesAt || 0,
      current: item.baseline.current,
    })
  }
  const combo = sortRecords(
    records.filter((r) => r.subject === item.subject && r.material === item.name),
  )
  let cum = 0
  for (const r of combo) {
    cum += r.minutes || 0
    if (Number.isFinite(r.progress)) {
      checkpoints.push({ date: r.date, minutesAt: cum, current: r.progress })
    }
  }
  checkpoints.sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : a.minutesAt - b.minutesAt,
  )
  return checkpoints
}

// 教材1件の進捗状況。unit/total が未設定なら null(進捗機能を使っていない教材)。
export function materialProgress(records, item) {
  if (!item?.unit || !Number.isFinite(item?.total) || item.total <= 0) return null

  const checkpoints = buildCheckpoints(records, item)
  if (checkpoints.length === 0) {
    return { unit: item.unit, total: item.total, current: 0, remaining: item.total, remainingMinutes: null }
  }

  const last = checkpoints[checkpoints.length - 1]
  const current = last.current
  const remaining = Math.max(0, item.total - current)

  let remainingMinutes = null
  if (remaining === 0) {
    remainingMinutes = 0
  } else if (checkpoints.length >= 2) {
    const cutoff = addDaysStr(todayStr(), -RECENT_WINDOW_DAYS)
    const inWindow = checkpoints.find((c) => c.date >= cutoff && c !== last)
    const start = inWindow || checkpoints[checkpoints.length - 2]
    const dMinutes = last.minutesAt - start.minutesAt
    const dCurrent = last.current - start.current
    if (dCurrent > 0 && dMinutes >= 0) {
      remainingMinutes = Math.round((dMinutes / dCurrent) * remaining)
    }
  }

  return { unit: item.unit, total: item.total, current, remaining, remainingMinutes }
}
