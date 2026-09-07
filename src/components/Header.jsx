import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../theme/ThemeProvider.jsx'
import { TABS, useNavigation } from '../navigation/NavigationContext.jsx'

// 画面上部の細いバー。左にタイトル、右にテーマ切替。
export default function Header() {
  const { theme, toggle } = useTheme()
  const { tab } = useNavigation()
  const label = TABS.find((t) => t.key === tab)?.label ?? ''

  return (
    <header
      className="relative shrink-0 border-b border-line bg-void backdrop-blur-sm"
      // iPhone のステータスバー(時計・電波・電池)と重ならないよう、
      // 上端に安全余白を足す。ホーム画面から起動した PWA で効く。
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <span
        aria-hidden
        className="edge-line pointer-events-none absolute inset-x-0 bottom-0 h-px"
      />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="font-hud text-glow text-base font-bold tracking-widest text-cyan">
            勉強時間
          </span>
          <span className="text-xs text-hud-faint">{label}</span>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === 'light' ? 'ダークテーマに切り替え' : 'ライトテーマに切り替え'}
          className="flex h-9 w-9 items-center justify-center rounded-sharp border border-line text-hud-dim hover:text-hud"
        >
          {theme === 'light' ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
        </button>
      </div>
    </header>
  )
}
