import PieChart from './PieChart.jsx'
import { groupBy, sumMinutes } from '../utils/aggregate.js'
import { formatMinutes } from '../utils/date.js'

// 指定キー(subject / material / activity)で集計したドーナツ + 凡例リスト。
// ホーム・カレンダー・総計・月間サマリーで共用。
export default function GroupBreakdown({
  records,
  field = 'subject',
  centerTop = '合計',
  size = 176,
  showCount = false,
}) {
  const rows = groupBy(records, field)
  const total = sumMinutes(records)
  if (total === 0) return null

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="shrink-0">
        <PieChart data={rows} size={size} centerTop={centerTop} centerMain={formatMinutes(total)} />
      </div>
      <ul className="flex w-full flex-1 flex-col gap-1.5">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2 py-1 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="min-w-0 flex-1 truncate text-hud">
              {row.key}
              {showCount && (
                <span className="ml-1 text-[11px] text-hud-faint">{row.count}件</span>
              )}
            </span>
            <span className="font-digit shrink-0 text-hud-dim">{formatMinutes(row.minutes)}</span>
            <span className="font-digit w-10 shrink-0 text-right text-hud-faint">
              {total > 0 ? Math.round((row.minutes / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
