import { ChartColumn, CalendarDays, Scale, ChevronRight } from 'lucide-react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import SubjectBreakdown from '../components/SubjectBreakdown.jsx'
import RecordRow from '../components/RecordRow.jsx'
import { useData } from '../data/DataProvider.jsx'
import { useNavigation } from '../navigation/NavigationContext.jsx'
import { recordsOnDate, sumMinutes } from '../utils/aggregate.js'
import { todayStr, formatDateLabel, formatMinutes } from '../utils/date.js'

const LINKS = [
  { tab: 'total', label: '総勉強時間', icon: ChartColumn },
  { tab: 'calendar', label: 'カレンダー', icon: CalendarDays },
  { tab: 'compare', label: '前の期間と比較', icon: Scale },
]

export default function HomeScreen() {
  const { records, loading } = useData()
  const { setTab } = useNavigation()
  const today = todayStr()
  const todayRecords = recordsOnDate(records, today)
  const todayMin = sumMinutes(todayRecords)

  return (
    <ScreenScaffold>
      {/* 今日の合計 — 画面で最も目立たせる(spec 7.1) */}
      <section className="panel px-5 py-6 text-center">
        <p className="text-xs tracking-wide text-hud-dim">{formatDateLabel(today)} の勉強時間</p>
        <p className="font-digit text-glow mt-1 text-5xl font-bold leading-none text-cyan">
          {formatMinutes(todayMin)}
        </p>
      </section>

      {/* 今日の教科別割合 */}
      <section className="panel px-4 py-4">
        <p className="field-label mb-3">今日の教科別</p>
        {loading ? (
          <p className="text-sm text-hud-faint">読み込み中…</p>
        ) : todayMin === 0 ? (
          <p className="py-4 text-center text-sm text-hud-faint">
            今日はまだ記録がありません。<br />
            右下の「記録する」から追加できます。
          </p>
        ) : (
          <SubjectBreakdown records={todayRecords} centerTop="今日" />
        )}
      </section>

      {/* 今日の記録 */}
      {todayRecords.length > 0 && (
        <section>
          <p className="field-label mb-2">今日の記録（{todayRecords.length}件）</p>
          <div className="flex flex-col gap-2">
            {todayRecords.map((r) => (
              <RecordRow key={r.id} record={r} showDate={false} />
            ))}
          </div>
        </section>
      )}

      {/* 他画面への導線 */}
      <section className="flex flex-col gap-2">
        {LINKS.map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            type="button"
            onClick={() => setTab(tab)}
            className="panel flex items-center gap-3 px-4 py-3 text-left hover:brightness-110"
          >
            <Icon size={18} strokeWidth={1.5} className="shrink-0 text-cyan" />
            <span className="flex-1 text-sm text-hud">{label}</span>
            <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-hud-faint" />
          </button>
        ))}
      </section>
    </ScreenScaffold>
  )
}
