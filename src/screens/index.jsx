import SettingsScreen from './SettingsScreen.jsx'
import HomeScreen from './HomeScreen.jsx'
import CalendarScreen from './CalendarScreen.jsx'
import TotalScreen from './TotalScreen.jsx'
import CompareScreen from './CompareScreen.jsx'
import ExportScreen from './ExportScreen.jsx'

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
      return <CompareScreen />
    case 'export':
      return <ExportScreen />
    case 'settings':
      return <SettingsScreen />
    default:
      return null
  }
}
