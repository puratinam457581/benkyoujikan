import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import SubjectBreakdown from '../components/SubjectBreakdown.jsx'
import RecordRow from '../components/RecordRow.jsx'
import { useData } from '../data/DataProvider.jsx'
import { minutesByDate, recordsOnDate } from '../utils/aggregate.js'
import {
  todayStr,
  fromDateStr,
  toDateStr,
  startOfMonthStr,
  addMonthsStr,
  formatDateLabel,
  formatMinutes,
  formatHoursShort,
} from '../utils/date.js'

const WEEK = ['日', '月', '火', '水', '木', '金', '土']

export default function CalendarScreen() {
  const { records, loading } = useData()
  const today = todayStr()
  const [viewMonth, setViewMonth] = useState(() => startOfMonthStr(today)) // 'YYYY-MM-01'
  const [selected, setSelected] = useState(today)

  const totals = useMemo(() => minutesByDate(records), [records])

  const first = fromDateStr(viewMonth)
  const year = first.getFullYear()
  const month = first.getMonth() // 0-11
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = first.getDay() // 日曜=0

  // カレンダーのマス目(先頭に前月ぶんの空白、末尾も7の倍数まで空白)
  const cells = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toDateStr(new Date(year, month, d)))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const monthTotal = cells.reduce((s, ds) => s + (ds ? totals.get(ds) || 0 : 0), 0)
  const maxDay = Math.max(1, ...cells.map((ds) => (ds ? totals.get(ds) || 0 : 0)))

  const selectedRecords = selected ? recordsOnDate(records, selected) : []
  const selectedMin = selectedRecords.reduce((s, r) => s + r.minutes, 0)

  return (
    <ScreenScaffold>
      {/* 月の切り替え */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="前の月"
          onClick={() => setViewMonth((m) => addMonthsStr(m, -1))}
          className="rounded-sharp border border-line p-2 text-hud-dim hover:text-hud"
        >
          <ChevronLeft size={18} strokeWidth={1.75} />
        </button>
        <div className="text-center">
          <p className="font-hud text-lg font-bold text-hud">
            {year}年{month + 1}月
          </p>
          <p className="font-digit text-xs text-hud-faint">計 {formatMinutes(monthTotal)}</p>
        </div>
        <button
          type="button"
          aria-label="次の月"
          onClick={() => setViewMonth((m) => addMonthsStr(m, 1))}
          className="rounded-sharp border border-line p-2 text-hud-dim hover:text-hud"
        >
          <ChevronRight size={18} strokeWidth={1.75} />
        </button>
      </div>

      {startOfMonthStr(today) !== viewMonth && (
        <button
          type="button"
          onClick={() => setViewMonth(startOfMonthStr(today))}
          className="chip self-center"
        >
          今月に戻る
        </button>
      )}

      {/* カレンダー本体 */}
      <div className="panel p-2">
        <div className="grid grid-cols-7">
          {WEEK.map((w, i) => (
            <div
              key={w}
              className={`pb-1 text-center text-[11px] font-semibold ${
                i === 0 ? 'text-alert' : i === 6 ? 'text-electric' : 'text-hud-faint'
              }`}
            >
              {w}
            </div>
          ))}

          {cells.map((ds, i) => {
            if (!ds) return <div key={`e${i}`} className="h-14" />
            const min = totals.get(ds) || 0
            const isToday = ds === today
            const isSel = ds === selected
            const intensity = min > 0 ? 0.12 + 0.5 * (min / maxDay) : 0
            return (
              <button
                key={ds}
                type="button"
                onClick={() => setSelected(ds)}
                className={`relative m-0.5 flex h-14 flex-col items-center justify-center rounded-sharp border text-center ${
                  isSel ? 'border-cyan' : 'border-transparent'
                }`}
                style={{
                  backgroundColor:
                    intensity > 0
                      ? `color-mix(in srgb, var(--color-cyan) ${Math.round(intensity * 100)}%, transparent)`
                      : 'transparent',
                }}
              >
                <span
                  className={`font-digit text-xs ${
                    isToday ? 'font-bold text-cyan' : 'text-hud-dim'
                  }`}
                >
                  {fromDateStr(ds).getDate()}
                </span>
                {min > 0 && (
                  <span className="font-digit text-[10px] leading-tight text-hud">
                    {formatHoursShort(min)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 選択した日の内訳 */}
      <section className="panel px-4 py-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="field-label">{selected ? formatDateLabel(selected) : '日付を選択'}</p>
          <p className="font-digit text-sm text-hud-dim">{formatMinutes(selectedMin)}</p>
        </div>

        {loading ? (
          <p className="text-sm text-hud-faint">読み込み中…</p>
        ) : selectedMin === 0 ? (
          <p className="py-3 text-center text-sm text-hud-faint">この日の記録はありません。</p>
        ) : (
          <>
            <SubjectBreakdown records={selectedRecords} centerTop="合計" size={150} />
            <div className="mt-4 flex flex-col gap-2">
              {selectedRecords.map((r) => (
                <RecordRow key={r.id} record={r} showDate={false} />
              ))}
            </div>
          </>
        )}
      </section>
    </ScreenScaffold>
  )
}
