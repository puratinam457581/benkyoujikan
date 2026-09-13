import { FileText, ChevronRight } from 'lucide-react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import Section from '../components/Section.jsx'
import SubjectBreakdown from '../components/SubjectBreakdown.jsx'
import RecordRow from '../components/RecordRow.jsx'
import DiaryCard from '../components/DiaryCard.jsx'
import { useData } from '../data/DataProvider.jsx'
import { useNavigation } from '../navigation/NavigationContext.jsx'
import { recordsOnDate, sumMinutes } from '../utils/aggregate.js'
import { todayStr, formatDateLabel, formatMinutes } from '../utils/date.js'

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
        <p className="font-digit text-glow mt-1.5 text-5xl font-bold leading-none text-cyan">
          {formatMinutes(todayMin)}
        </p>
        {todayRecords.length > 0 && (
          <p className="mt-2.5 text-[11px] text-hud-faint">記録 {todayRecords.length} 件</p>
        )}
      </section>

      {loading ? (
        <p className="text-sm text-hud-faint">読み込み中…</p>
      ) : todayMin === 0 ? (
        <p className="panel px-4 py-8 text-center text-sm leading-relaxed text-hud-faint">
          今日はまだ記録がありません。
          <br />
          右下の「記録する」から追加できます。
        </p>
      ) : (
        <>
          <Section title="今日の教科別">
            <SubjectBreakdown records={todayRecords} centerTop="今日" />
          </Section>

          <Section title="今日の記録" bare>
            <div className="flex flex-col gap-2">
              {todayRecords.map((r) => (
                <RecordRow key={r.id} record={r} showDate={false} />
              ))}
            </div>
          </Section>
        </>
      )}

      {/* 今日の日記(任意) */}
      <DiaryCard date={today} title="今日の日記(任意)" />

      {/* 毎朝の中核動線。他の画面へはタブバーから行けるので、ここには置かない */}
      <button
        type="button"
        onClick={() => setTab('export')}
        className="panel flex items-center gap-3 border-cyan px-4 py-3.5 text-left hover:brightness-110"
      >
        <FileText size={18} strokeWidth={1.5} className="shrink-0 text-cyan" />
        <span className="flex-1 text-sm font-semibold text-cyan">学習計画用のログを出力</span>
        <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-hud-faint" />
      </button>
    </ScreenScaffold>
  )
}
