// 日付まわりのユーティリティ。
// 記録の date は「その人の端末のローカル日付」を 'YYYY-MM-DD' 文字列で持つ。
// タイムゾーンを跨ぐ利用は想定しないため、UTC 変換はしない。

const pad = (n) => String(n).padStart(2, '0')

// Date → 'YYYY-MM-DD'
export function toDateStr(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 今日の 'YYYY-MM-DD'
export function todayStr() {
  return toDateStr(new Date())
}

// 'YYYY-MM-DD' → Date(その日の 00:00 ローカル)
export function fromDateStr(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// n 日前/後の 'YYYY-MM-DD'(n が負なら過去)
export function addDaysStr(s, n) {
  const d = fromDateStr(s)
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

// 分 → 「1時間30分」形式(0分は「0分」)
export function formatMinutes(min) {
  const m = Math.max(0, Math.round(min || 0))
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r}分`
  if (r === 0) return `${h}時間`
  return `${h}時間${r}分`
}

// 分 → 「3.5h」形式(カレンダーのセル内など、狭い場所向け)
export function formatHoursShort(min) {
  const h = (Math.max(0, min || 0) / 60)
  // 小数第1位まで。末尾の .0 は消す
  return `${Number(h.toFixed(1))}h`
}
