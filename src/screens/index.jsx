import PlaceholderScreen from './PlaceholderScreen.jsx'
import SettingsScreen from './SettingsScreen.jsx'
import HomeScreen from './HomeScreen.jsx'
import CalendarScreen from './CalendarScreen.jsx'
import TotalScreen from './TotalScreen.jsx'

// tab キー → 画面。
export function renderScreen(tab) {
  switch (tab) {
    case 'home':
      return <HomeScreen />
    case 'calendar':
      return <CalendarScreen />
    case 'total':
      return <TotalScreen />
    case 'compare':
      return (
        <PlaceholderScreen
          title="比較"
          phase="フェーズ7"
          note="今日/昨日・今週/先週・今月/先月 の固定比較を表示します。"
        />
      )
    case 'settings':
      return <SettingsScreen />
    default:
      return null
  }
}
