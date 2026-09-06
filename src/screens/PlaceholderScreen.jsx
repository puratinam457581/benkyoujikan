import ScreenScaffold from '../components/ScreenScaffold.jsx'
import { useData } from '../data/DataProvider.jsx'
import { formatMinutes } from '../utils/date.js'

// フェーズ2の仮画面。フェーズ4以降で本物に置き換える。
// 読み込んだ記録の件数だけ出して、データ層が生きていることを見せる。
export default function PlaceholderScreen({ title, phase, note }) {
  const { records, loading } = useData()
  const totalMin = records.reduce((s, r) => s + r.minutes, 0)

  return (
    <ScreenScaffold title={title} description={`${phase} で実装します。`}>
      <div className="panel px-4 py-3 text-sm">
        <p className="text-hud-dim">現在の読み込み状況</p>
        {loading ? (
          <p className="mt-1 text-hud-faint">読み込み中…</p>
        ) : (
          <p className="mt-1 font-digit text-lg font-bold text-hud">
            記録 {records.length} 件 / 合計 {formatMinutes(totalMin)}
          </p>
        )}
      </div>
      {note && <p className="text-sm text-hud-faint">{note}</p>}
    </ScreenScaffold>
  )
}
