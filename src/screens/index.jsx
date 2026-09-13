import SettingsScreen from './SettingsScreen.jsx'
import HomeScreen from './HomeScreen.jsx'
import CalendarScreen from './CalendarScreen.jsx'
import AnalysisScreen from './AnalysisScreen.jsx'
import ExportScreen from './ExportScreen.jsx'

// tab キー → 画面。
export function renderScreen(tab) {
  switch (tab) {
    case 'home':
      return <HomeScreen />
    case 'calendar':
      return <CalendarScreen />
    case 'analysis':
      return <AnalysisScreen />
    case 'export':
      return <ExportScreen />
    case 'settings':
      return <SettingsScreen />
    default:
      return null
  }
}
