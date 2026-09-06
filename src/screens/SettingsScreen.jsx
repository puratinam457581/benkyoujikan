import { LogOut, Sun, Moon } from 'lucide-react'
import ScreenScaffold from '../components/ScreenScaffold.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useTheme } from '../theme/ThemeProvider.jsx'
import { useData } from '../data/DataProvider.jsx'
import { formatMinutes } from '../utils/date.js'

export default function SettingsScreen() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { records } = useData()
  const totalMin = records.reduce((s, r) => s + r.minutes, 0)

  return (
    <ScreenScaffold title="設定">
      {/* アカウント */}
      <section className="panel px-4 py-3">
        <p className="text-xs text-hud-dim">ログイン中のアカウント</p>
        <p className="mt-1 font-semibold text-hud">{user?.displayName || '(名前なし)'}</p>
        <p className="text-sm text-hud-faint">{user?.email}</p>
        <p className="mt-2 text-xs text-hud-faint">
          記録 {records.length} 件 / 累計 {formatMinutes(totalMin)}
        </p>
        <button className="btn btn-ghost mt-3 text-sm" onClick={signOut}>
          <LogOut size={16} strokeWidth={1.5} />
          サインアウト
        </button>
      </section>

      {/* テーマ */}
      <section className="panel px-4 py-3">
        <p className="text-xs text-hud-dim">テーマ</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-panel border px-3 py-2 text-sm ${
              theme === 'dark'
                ? 'border-cyan text-cyan'
                : 'border-line text-hud-dim hover:text-hud'
            }`}
          >
            <Sun size={16} strokeWidth={1.5} />
            ダーク
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-panel border px-3 py-2 text-sm ${
              theme === 'light'
                ? 'border-cyan text-cyan'
                : 'border-line text-hud-dim hover:text-hud'
            }`}
          >
            <Moon size={16} strokeWidth={1.5} />
            ライト
          </button>
        </div>
        <p className="mt-2 text-xs text-hud-faint">
          選んだテーマはこの端末に保存され、次回起動時も同じ表示になります。
        </p>
      </section>

      <p className="text-xs text-hud-faint">
        教材ごとの色・アイコンの設定はフェーズ3で追加します。
      </p>
    </ScreenScaffold>
  )
}
