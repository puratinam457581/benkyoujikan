import { useState } from 'react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import TotalView from './TotalScreen.jsx'
import CompareView from './CompareScreen.jsx'

// 分析タブ。旧「総計」と旧「比較」は、どちらも集計を見る画面で
// 教科別ドーナツも重複していたため、1タブにまとめて中で切り替える。
const VIEWS = [
  { key: 'total', label: '累計' },
  { key: 'compare', label: '前の期間と比較' },
]

export default function AnalysisScreen() {
  const [view, setView] = useState('total')

  return (
    <ScreenScaffold>
      <div className="segmented">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            aria-pressed={view === v.key}
            onClick={() => setView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'total' ? <TotalView /> : <CompareView />}
    </ScreenScaffold>
  )
}
