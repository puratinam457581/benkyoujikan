// 固定パターンの期間比較(spec 8章)。日次/週次/月次のみ。

import { recordsInRange, sumMinutes, groupBy } from './aggregate.js'
import {
  todayStr,
  addDaysStr,
  startOfWeekStr,
  startOfMonthStr,
  addMonthsStr,
  fromDateStr,
  toDateStr,
} from './date.js'

const weekEnd = (startStr) => addDaysStr(startStr, 6)
const monthEnd = (startStr) => {
  const d = fromDateStr(startStr)
  return toDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

// mode: 'day' | 'week' | 'month'
export function comparePeriods(records, mode) {
  const today = todayStr()
  let cur, prev, curLabel, prevLabel

  if (mode === 'day') {
    const y = addDaysStr(today, -1)
    cur = [today, today]
    prev = [y, y]
    curLabel = '今日'
    prevLabel = '昨日'
  } else if (mode === 'week') {
    const cs = startOfWeekStr(today)
    const ps = addDaysStr(cs, -7)
    cur = [cs, weekEnd(cs)]
    prev = [ps, weekEnd(ps)]
    curLabel = '今週'
    prevLabel = '先週'
  } else {
    const cs = startOfMonthStr(today)
    const ps = addMonthsStr(cs, -1)
    cur = [cs, monthEnd(cs)]
    prev = [ps, monthEnd(ps)]
    curLabel = '今月'
    prevLabel = '先月'
  }

  const curRecords = recordsInRange(records, cur[0], cur[1])
  const prevRecords = recordsInRange(records, prev[0], prev[1])
  const curTotal = sumMinutes(curRecords)
  const prevTotal = sumMinutes(prevRecords)
  const diff = curTotal - prevTotal
  const pct = prevTotal > 0 ? (diff / prevTotal) * 100 : curTotal > 0 ? 100 : 0

  // 教科別の増減(両期間に出てくる教科すべて)
  const curBy = new Map(groupBy(curRecords, 'subject').map((r) => [r.key, r]))
  const prevBy = new Map(groupBy(prevRecords, 'subject').map((r) => [r.key, r]))
  const keys = new Set([...curBy.keys(), ...prevBy.keys()])
  const subjects = [...keys]
    .map((k) => {
      const c = curBy.get(k)?.minutes || 0
      const p = prevBy.get(k)?.minutes || 0
      return {
        key: k,
        color: (curBy.get(k) || prevBy.get(k)).color,
        cur: c,
        prev: p,
        diff: c - p,
      }
    })
    .sort((a, b) => b.cur - a.cur || b.prev - a.prev)

  return {
    mode,
    curLabel,
    prevLabel,
    cur,
    prev,
    curRecords,
    prevRecords,
    curTotal,
    prevTotal,
    diff,
    pct,
    subjects,
  }
}
