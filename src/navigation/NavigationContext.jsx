import { createContext, useContext, useState, useCallback } from 'react'

// ルーターは使わず、状態1つで表示中の画面を切り替える(spec 7章)。
// 画面数が少なく、URLで共有する要件も無いため、これで十分。
export const TABS = [
  { key: 'home', label: 'ホーム' },
  { key: 'calendar', label: 'カレンダー' },
  { key: 'total', label: '総計' },
  { key: 'compare', label: '比較' },
  { key: 'settings', label: '設定' },
]

const NavigationContext = createContext(null)

export function NavigationProvider({ children }) {
  const [tab, setTab] = useState('home')

  // カレンダーで日付を選んで内訳を見る等、タブ内の遷移で使う小さなスタック。
  // フェーズ5以降で活用する。今は tab 切替のみ。
  const [detail, setDetail] = useState(null) // 例: { type: 'day', date: '2026-09-07' }

  // 記録モーダル。open=表示中、prefill=初期値(編集や「前回と同じ」で使う)
  const [record, setRecord] = useState({ open: false, prefill: null })

  const goTab = useCallback((key) => {
    setTab(key)
    setDetail(null)
  }, [])

  const openDetail = useCallback((d) => setDetail(d), [])
  const closeDetail = useCallback(() => setDetail(null), [])

  const openRecord = useCallback((prefill = null) => setRecord({ open: true, prefill }), [])
  const closeRecord = useCallback(() => setRecord({ open: false, prefill: null }), [])

  return (
    <NavigationContext.Provider
      value={{
        tab,
        setTab: goTab,
        detail,
        openDetail,
        closeDetail,
        record,
        openRecord,
        closeRecord,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation は NavigationProvider の中で使ってください')
  return ctx
}
