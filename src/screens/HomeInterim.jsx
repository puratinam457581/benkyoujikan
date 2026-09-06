import ScreenScaffold from '../components/ScreenScaffold.jsx'
import RecordRow from '../components/RecordRow.jsx'
import { useData } from '../data/DataProvider.jsx'
import { todayStr, formatMinutes } from '../utils/date.js'

// フェーズ3時点のホーム。フェーズ4で「今日の合計・円グラフ」を載せて作り直す。
// いまは記録が入っていくのを確認できるよう、当日合計と最近の記録を出す。
export default function HomeInterim() {
  const { records, loading } = useData()
  const today = todayStr()
  const todayMin = records.filter((r) => r.date === today).reduce((s, r) => s + r.minutes, 0)
  const totalMin = records.reduce((s, r) => s + r.minutes, 0)
  const recent = records.slice(0, 15)

  return (
    <ScreenScaffold title="ホーム" description="フェーズ4 で今日の合計と円グラフに作り直します。">
      <div className="grid grid-cols-2 gap-3">
        <div className="panel px-4 py-3">
          <p className="text-xs text-hud-dim">今日</p>
          <p className="font-digit mt-1 text-2xl font-bold text-cyan">
            {formatMinutes(todayMin)}
          </p>
        </div>
        <div className="panel px-4 py-3">
          <p className="text-xs text-hud-dim">累計</p>
          <p className="font-digit mt-1 text-2xl font-bold text-hud">
            {formatMinutes(totalMin)}
          </p>
        </div>
      </div>

      <div>
        <p className="field-label mb-2">最近の記録</p>
        {loading ? (
          <p className="text-sm text-hud-faint">読み込み中…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-hud-faint">
            まだ記録がありません。右下の「記録する」から追加できます。
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((r) => (
              <RecordRow key={r.id} record={r} />
            ))}
          </div>
        )}
      </div>
    </ScreenScaffold>
  )
}
