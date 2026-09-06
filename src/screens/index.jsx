import PlaceholderScreen from './PlaceholderScreen.jsx'
import SettingsScreen from './SettingsScreen.jsx'

// tab キー → 画面。フェーズ2では設定以外は仮画面。
export function renderScreen(tab) {
  switch (tab) {
    case 'home':
      return (
        <PlaceholderScreen
          title="ホーム"
          phase="フェーズ4"
          note="今日の合計勉強時間と教科別の円グラフ、記録ボタンをここに置きます。"
        />
      )
    case 'calendar':
      return (
        <PlaceholderScreen
          title="カレンダー"
          phase="フェーズ5"
          note="月表示のカレンダーで、日ごとの合計と内訳を見られるようにします。"
        />
      )
    case 'total':
      return (
        <PlaceholderScreen
          title="総計"
          phase="フェーズ6"
          note="これまでの総勉強時間と、教科・活動別の集計をグラフとリストで表示します。"
        />
      )
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
