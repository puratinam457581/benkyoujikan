import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import TabBar from './TabBar.jsx'
import Fab from './Fab.jsx'
import RecordModal from '../screens/RecordModal.jsx'
import PwaBanner from '../pwa/PwaBanner.jsx'
import { useNavigation } from '../navigation/NavigationContext.jsx'
import { renderScreen } from '../screens/index.jsx'

// 画面全体の骨組み。
//   スマホ幅 : Header / 本文 / TabBar の縦積み
//   PC幅     : 左に Sidebar、右に上記の縦積み
// 記録ボタン(Fab)と記録モーダル(RecordModal)は全画面共通で重ねる。
export default function AppShell() {
  const { tab, record } = useNavigation()

  return (
    <div className="app-viewport">
      <div className="app-frame">
        <div className="flex h-full">
          <Sidebar />
          <div className="app-body">
            <Header />
            <div className="app-scroll">{renderScreen(tab)}</div>
            <PwaBanner />
            <TabBar />
          </div>
        </div>
        <Fab />
        {record.open && <RecordModal />}
      </div>
    </div>
  )
}
